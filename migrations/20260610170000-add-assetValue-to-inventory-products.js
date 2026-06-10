'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add column
    await queryInterface.addColumn('inventory_products', 'assetValue', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // 2. Backfill slabs
    const sqlSlabs = `
      UPDATE inventory_products ip
      JOIN slabs s ON s.inventoryProductId = ip.id
      SET ip.assetValue = COALESCE(
        (CASE WHEN s.packageLength > 0 AND s.packageWidth > 0 THEN (s.packageLength * s.packageWidth / 144) ELSE NULL END),
        (CASE WHEN s.receivingLength > 0 AND s.receivingWidth > 0 THEN (s.receivingLength * s.receivingWidth / 144) ELSE NULL END),
        0
      ) * COALESCE(ip.landedUnitCost, 0)
      WHERE ip.isSlabType = TRUE;
    `;
    await queryInterface.sequelize.query(sqlSlabs, { raw: true });

    // 3. Backfill generic products
    const sqlGeneric = `
      UPDATE inventory_products ip
      SET ip.assetValue = COALESCE(ip.landedUnitCost, 0)
      WHERE ip.isSlabType = FALSE;
    `;
    await queryInterface.sequelize.query(sqlGeneric, { raw: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inventory_products', 'assetValue');
  },
};
