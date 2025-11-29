"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename paymentTerm column to paymentTermId
    await queryInterface.renameColumn("purchase_orders", "paymentTerm", "paymentTermId");
  },

  async down(queryInterface, Sequelize) {
    // Rename paymentTermId column back to paymentTerm
    await queryInterface.renameColumn("purchase_orders", "paymentTermId", "paymentTerm");
  },
};
