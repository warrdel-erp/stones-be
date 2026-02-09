import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Bin from "./bin.model";
import SIPL from "./sipl.model";
import { INVENTORY_ITEM_STATUS } from "../constants";
import Product from "./product.model";
import Client from "./client.model";
import Location from "./location.model";

const InventoryProduct = sequelize.define(
  "InventoryProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    binId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Bin,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    siplId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SIPL,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    sellingPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    landedUnitCost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(INVENTORY_ITEM_STATUS)),
      allowNull: true,
      defaultValue: INVENTORY_ITEM_STATUS.INITIATE,
    },
    combinedNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      // unique: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    isSlabType: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "inventory_products",
    timestamps: true,
  }
);

// Scope configuration for InventoryProduct model
(InventoryProduct as any).scopeConfig = {
  client: true,
  location: true,
};

export default InventoryProduct;

InventoryProduct.beforeUpdate((inventoryProduct) => {
  delete inventoryProduct.dataValues.id;
  delete inventoryProduct.dataValues.combinedNumber;
  delete inventoryProduct.dataValues.siplId;
  delete inventoryProduct.dataValues.productId;
}); 