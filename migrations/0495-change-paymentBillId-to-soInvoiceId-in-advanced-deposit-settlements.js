"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new soInvoiceId column
    await queryInterface.addColumn("advanced_deposit_settlements", "soInvoiceId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "sales_order_invoices",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Note: If there's existing data, you may need to backfill it here
    // For now, assuming this is a new feature with no existing data

    // Make soInvoiceId NOT NULL after data migration (if needed)
    await queryInterface.changeColumn("advanced_deposit_settlements", "soInvoiceId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "sales_order_invoices",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Remove old paymentBillId column
    await queryInterface.removeColumn("advanced_deposit_settlements", "paymentBillId");
  },

  down: async (queryInterface, Sequelize) => {
    // Add back paymentBillId column
    await queryInterface.addColumn("advanced_deposit_settlements", "paymentBillId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "payment_bills",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Remove soInvoiceId column
    await queryInterface.removeColumn("advanced_deposit_settlements", "soInvoiceId");
  },
};
