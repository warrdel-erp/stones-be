"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change amount from FLOAT to DECIMAL(15,2) in sales_order_invoices
    await queryInterface.changeColumn("sales_order_invoices", "amount", {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    });

    // Change taxableAmount from FLOAT to DECIMAL(15,2) in sales_order_invoices
    await queryInterface.changeColumn("sales_order_invoices", "taxableAmount", {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    });

    // Change taxValue from FLOAT to DECIMAL(15,2) in sales_order_invoices
    await queryInterface.changeColumn("sales_order_invoices", "taxValue", {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert amount back to FLOAT
    await queryInterface.changeColumn("sales_order_invoices", "amount", {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    // Revert taxableAmount back to FLOAT
    await queryInterface.changeColumn("sales_order_invoices", "taxableAmount", {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    // Revert taxValue back to FLOAT
    await queryInterface.changeColumn("sales_order_invoices", "taxValue", {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },
};
