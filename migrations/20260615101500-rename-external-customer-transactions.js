"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("external_customer_transactions", "customer_external_aged_invoices");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("customer_external_aged_invoices", "external_customer_transactions");
  },
};
