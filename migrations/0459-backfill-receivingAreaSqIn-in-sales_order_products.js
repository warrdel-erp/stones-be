"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Calculate and populate receivingAreaSqIn from slabs for existing sales order products
    const sql = `
      UPDATE sales_order_products sop
      JOIN inventory_products ip ON ip.id = sop.inventoryProductId
      JOIN slabs s ON s.inventoryProductId = ip.id
      SET sop.receivingAreaSqIn = (s.receivingLength * s.receivingWidth)
      WHERE sop.isSlabType = TRUE;
    `;
    await queryInterface.sequelize.query(sql, { raw: true });
  },

  async down(queryInterface) {
    // Reset all receivingAreaSqIn values
    await queryInterface.sequelize.query("UPDATE sales_order_products SET receivingAreaSqIn = NULL;", { raw: true });
  },
};
