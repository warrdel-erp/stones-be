"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Populate isSlabType from inventory_products for all existing sales order products
    const sql = `
      UPDATE sales_order_products sop
      JOIN inventory_products ip ON ip.id = sop.inventoryProductId
      SET sop.isSlabType = ip.isSlabType;
    `;
    await queryInterface.sequelize.query(sql, { raw: true });
  },

  async down(queryInterface) {
    // Reset all isSlabType values to true (default)
    await queryInterface.sequelize.query("UPDATE sales_order_products SET isSlabType = TRUE;", { raw: true });
  },
};
