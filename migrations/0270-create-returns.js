"use strict";

const RETURN_STATUS = {
  INITIATED: "initiated",
  COMPLETE: "complete",
  CANCELLED: "canceled",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "returns",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        code: {
          type: Sequelize.STRING,
        },
        roInvoiceNumber: {
          type: Sequelize.INTEGER,
        },
        status: {
          type: Sequelize.ENUM(...Object.values(RETURN_STATUS)),
          allowNull: false,
          defaultValue: RETURN_STATUS.INITIATED,
        },
        invoiceId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "sales_order_invoices",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        createdById: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        clientId: {
          type: Sequelize.INTEGER,
          references: {
            model: "clients",
            key: "id",
          },
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
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
          unique_roInvoiceNumber_invoiceId: {
            fields: ["roInvoiceNumber", "invoiceId"],
          },
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("returns");
  },
};
