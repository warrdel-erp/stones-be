"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add landedUnitCost to inventory_products
    await queryInterface.addColumn("inventory_products", "landedUnitCost", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // Copy landedUnitCost from slabs to inventory_products
    await queryInterface.sequelize.query(
      `UPDATE inventory_products ip
       INNER JOIN slabs s ON s.inventoryProductId = ip.id
       SET ip.landedUnitCost = s.landedUnitCost
       WHERE s.landedUnitCost IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Copy landedUnitCost from generic_products to inventory_products
    await queryInterface.sequelize.query(
      `UPDATE inventory_products ip
       INNER JOIN generic_products gp ON gp.inventoryProductId = ip.id
       SET ip.landedUnitCost = gp.landedUnitCost
       WHERE gp.landedUnitCost IS NOT NULL AND ip.landedUnitCost IS NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove landedUnitCost from slabs
    await queryInterface.removeColumn("slabs", "landedUnitCost");

    // Remove landedUnitCost from generic_products
    await queryInterface.removeColumn("generic_products", "landedUnitCost");
  },

  async down(queryInterface, Sequelize) {
    // Add back landedUnitCost to slabs
    await queryInterface.addColumn("slabs", "landedUnitCost", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // Add back landedUnitCost to generic_products
    await queryInterface.addColumn("generic_products", "landedUnitCost", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // Copy data back to slabs
    await queryInterface.sequelize.query(
      `UPDATE slabs s
       INNER JOIN inventory_products ip ON s.inventoryProductId = ip.id
       SET s.landedUnitCost = ip.landedUnitCost
       WHERE ip.landedUnitCost IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Copy data back to generic_products
    await queryInterface.sequelize.query(
      `UPDATE generic_products gp
       INNER JOIN inventory_products ip ON gp.inventoryProductId = ip.id
       SET gp.landedUnitCost = ip.landedUnitCost
       WHERE ip.landedUnitCost IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove landedUnitCost from inventory_products
    await queryInterface.removeColumn("inventory_products", "landedUnitCost");
  },
};
