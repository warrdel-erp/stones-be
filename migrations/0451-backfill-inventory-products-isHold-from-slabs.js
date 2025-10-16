"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Copy existing holds from slabs to inventory_products where linked
    const sql = `
      UPDATE inventory_products ip
      JOIN slabs s ON s.inventoryProductId = ip.id
      SET ip.isHold = s.isHold
      WHERE s.isHold = TRUE;
    `;
    await queryInterface.sequelize.query(sql, { raw: true });
  },

  async down(queryInterface) {
    // Reset all holds on inventory_products, cannot safely revert per-row mapping
    await queryInterface.sequelize.query("UPDATE inventory_products SET isHold = FALSE;", { raw: true });
  },
};

