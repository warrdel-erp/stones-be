"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename salesTax to salesTaxId
    await queryInterface.renameColumn("customers", "salesTax", "salesTaxId");
  },

  async down(queryInterface, Sequelize) {
    // Rename back to salesTax
    await queryInterface.renameColumn("customers", "salesTaxId", "salesTax");
  },
};
