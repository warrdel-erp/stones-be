"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Populate taxId from customer's salesTax for all existing sales orders
    const sql = `
      UPDATE sales_orders so
      JOIN customers c ON c.id = so.customerId
      SET so.taxId = c.salesTax
      WHERE c.salesTax IS NOT NULL;
    `;
    await queryInterface.sequelize.query(sql, { raw: true });
  },

  async down(queryInterface) {
    // Reset all taxId values in sales_orders
    await queryInterface.sequelize.query("UPDATE sales_orders SET taxId = NULL;", { raw: true });
  },
};
