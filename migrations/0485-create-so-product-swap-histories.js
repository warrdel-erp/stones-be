"use strict";

const SALE_ORDER_PRODUCT_STAGES = {
  SALES_ORDER: "saleOrder",
  LOADING_ORDER: "loadingOrder",
  PACKAGING_LIST: "packagingList",
  INVOICED: "invoiced",
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("so_product_swap_histories", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        type: Sequelize.ENUM(...Object.values(SALE_ORDER_PRODUCT_STAGES)),
        allowNull: false,
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
      salesProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sales_order_products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("so_product_swap_histories");
  },
};
