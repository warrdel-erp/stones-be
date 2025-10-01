"use strict";

module.exports = {
  up: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.createTable("invoice_deliveries", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fromLat: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      fromLng: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      fromAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      toLat: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      toLng: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      toAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      soInvoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sales_order_invoices",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      deliveryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "deliveries",
          key: "id",
        },
        onDelete: "CASCADE",
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  down: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.dropTable("invoice_deliveries");
  },
};
