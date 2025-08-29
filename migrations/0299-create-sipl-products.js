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
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      supplierNote: {
        type: Sequelize.TEXT,
      },
      siplId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sipls",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      requestedPurchaseProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "requested_purchase_products",
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("sipl_products");
  },
};
