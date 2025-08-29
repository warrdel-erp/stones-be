"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "packaging_lists",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        code: {
          type: Sequelize.STRING,
        },
        soPackagingListNumber: {
          type: Sequelize.INTEGER,
        },
        clientPlNumber: {
          type: Sequelize.INTEGER,
          allowNull: true, // Auto-Incremented and not null is handled in hook
        },
        status: {
          type: Sequelize.STRING,
          defaultValue: "active",
          allowNull: false,
        },
        loadingOrderId: {
          type: Sequelize.INTEGER,
          unique: true,
          allowNull: false,
          references: {
            model: "loading_orders",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
          unique_clientId_clientPlNumber: {
            fields: ["clientId", "clientPlNumber"],
          },
          unique_salesOrderId_soPackagingListNumber: {
            fields: ["salesOrderId", "soPackagingListNumber"],
          },
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("packaging_lists");
  },
};
