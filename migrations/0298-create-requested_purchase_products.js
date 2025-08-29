"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("sipl_products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      supplierNote: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      purchaseOrderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "purchase_orders",
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("sipl_products");
  },
};
