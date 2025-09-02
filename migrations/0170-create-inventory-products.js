"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("inventory_products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      binId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "bins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      siplId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sipls",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      sellingPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("INITIATE", "IN_INVENTORY", "ALLOCATED", "SOLD"),
        allowNull: true,
        defaultValue: "initiate",
      },
      combinedNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      isSlabType: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
    await queryInterface.dropTable("inventory_products");
  },
};
