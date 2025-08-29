"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "sales_order_invoices",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        invoiceCode: {
          type: Sequelize.STRING,
        },
        amount: {
          // total amount without tax.
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        taxableAmount: {
          // only amount that has to applied tax.
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        taxValue: {
          // total tax value as per taxable amount.
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        soInvoiceNumber: {
          type: Sequelize.INTEGER,
        },
        truckId: {
          type: Sequelize.INTEGER,
        },
        truckAssignedOn: {
          type: Sequelize.DATE,
        },
        clientSoInvoiceNumber: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        customerId: {
          type: Sequelize.INTEGER,
          references: {
            model: "customers",
            key: "id",
          },
          onUpdate: "CASCADE",
          allowNull: false,
        },
        salesOrderId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "sales_orders",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        loadingOrderId: {
          type: Sequelize.INTEGER,
          references: {
            model: "loading_orders",
            key: "id",
          },
          onUpdate: "CASCADE",
          allowNull: false,
        },
        clientId: {
          type: Sequelize.INTEGER,
          references: {
            model: "clients",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        unique_keys: {
          unique_clientId_clientSoInvoiceNumber: {
            fields: ["clientId", "clientSoInvoiceNumber"],
          },
          unique_salesOrderId_soInvoiceNumber: {
            fields: ["salesOrderId", "soInvoiceNumber"],
          },
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("sales_order_invoices");
  },
};
