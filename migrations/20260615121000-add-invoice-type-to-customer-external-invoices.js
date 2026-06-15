"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customer_external_invoices", "invoiceType", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "sale",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customer_external_invoices", "invoiceType");
  },
};
