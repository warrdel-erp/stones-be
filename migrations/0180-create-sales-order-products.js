"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("sales_order_products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
      },
      taxApplied: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: false,
      },
      picked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      loRemeasureLength: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      loRemeasureWidth: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      plRemeasureLength: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      plRemeasureWidth: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      stage: {
        type: Sequelize.ENUM("saleOrder", "loadingOrder", "packagingList", "invoiced"), // Sales Order, Loading Order, Packaging List
        allowNull: false,
        defaultValue: "saleOrder",
      },
      inventoryProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "inventory_products",
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
      loadingOrderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "loading_orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      packagingListId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "packaging_lists",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("sales_order_products");
  },
};
