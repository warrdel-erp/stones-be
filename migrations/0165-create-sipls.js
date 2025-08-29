"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "sipls",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        clientInvoiceNumber: {
          type: Sequelize.INTEGER,
          allowNull: true, // Auto-Incremented and not null is handled in hook
        },
        dueDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        shipDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        clientInvoiceDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        poSiplNumber: {
          type: Sequelize.INTEGER,
          allowNull: false, // Auto-Incremented and not null is handled in hook
        },
        invoiceCode: {
          type: Sequelize.STRING,
          allowNull: true, // Auto-Incremented and not null is handled in hook
        },
        supplierInvoiceNumber: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        supplierInvoiceDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        supplierNotes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "pending",
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        updatedBy: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: "users",
            key: "id",
          },
        },
        inventoryReceived: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        purchaseOrderId: {
          type: Sequelize.INTEGER,
          references: {
            model: "purchase_orders",
            key: "id",
          },
        },
        purchaseLocationId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "locations",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        shipmentLocationId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "locations",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
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
          unique_client_clientInvoiceNumber: {
            fields: ["clientId", "clientInvoiceNumber"],
          },
          unique_purchaseOrderId_poSiplNumber: {
            fields: ["purchaseOrderId", "poSiplNumber"],
          },
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("sipls");
  },
};
