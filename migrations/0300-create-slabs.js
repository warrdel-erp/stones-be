"use strict";

const SLAB_ENTRY_UNIT = {
  METER: "meter",
  FEET: "feet",
  IN: "in",
};

const INVENTORY_ITEM_STATUS = {
  INITIATE: "INITIATE",
  IN_INVENTORY: "IN_INVENTORY",
  ALLOCATED: "ALLOCATED",
  SOLD: "SOLD",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "slabs",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        serialNumber: {
          type: Sequelize.INTEGER,
        },
        slabNumber: {
          type: Sequelize.INTEGER,
        },
        entryUnit: {
          type: Sequelize.ENUM(...Object.values(SLAB_ENTRY_UNIT)),
          allowNull: true,
        },
        packageLength: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        packageWidth: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        receivingLength: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        receivingWidth: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        block: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        lot: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        barcode: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: {
            name: "unique_barcode_constraint",
            msg: "unique barcode",
          },
        },
        status: {
          type: Sequelize.ENUM(...Object.values(INVENTORY_ITEM_STATUS)),
          allowNull: true,
          defaultValue: INVENTORY_ITEM_STATUS.INITIATE,
        },
        isHold: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        updatedBy: {
          type: Sequelize.INTEGER,
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
          onDelete: "CASCADE",
        },
        landedUnitCost: {
          type: Sequelize.FLOAT,
          allowNull: true,
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
        inventoryProductId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "inventory_products",
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
          onDelete: "NO ACTION",
          onUpdate: "CASCADE",
        },
        siplProductId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "sipl_products",
            key: "id",
          },
          onDelete: "NO ACTION",
          onUpdate: "CASCADE",
        },
        clientId: {
          type: Sequelize.INTEGER,
          allowNull: false,
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
          unique_purchaseOrderId_siplId_serialNumber: {
            fields: ["purchaseOrderId", "siplId", "serialNumber"],
          },
          unique_productId_siplId_slabNumber: {
            fields: ["productId", "siplId", "slabNumber"],
          },
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("slabs");
  },
};
