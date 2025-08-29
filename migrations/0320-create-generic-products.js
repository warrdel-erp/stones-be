"use strict";

const INVENTORY_ITEM_STATUS = {
  INITIATE: "INITIATE",
  IN_INVENTORY: "IN_INVENTORY",
  ALLOCATED: "ALLOCATED",
  SOLD: "SOLD",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("generic_products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      barcode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      landedUnitCost: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      isHold: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
      updatedById: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
      siplId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sipls",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      inventoryProductId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "inventory_products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      status: {
        type: Sequelize.ENUM(...Object.values(INVENTORY_ITEM_STATUS)),
        allowNull: true,
        defaultValue: INVENTORY_ITEM_STATUS.INITIATE,
      },
      siplProductId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sipl_products",
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
    await queryInterface.dropTable("generic_products");
  },
};
