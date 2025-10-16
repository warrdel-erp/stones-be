import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Bin from "./bin.model";
import SIPL from "./sipl.model";
import { INVENTORY_ITEM_STATUS } from "../constants";
import Product from "./product.model";
import Client from "./client.model";

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
      allowNull: false,
      references: {
        model: Bin,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    isInCart: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(INVENTORY_ITEM_STATUS)),
      allowNull: true,
      defaultValue: INVENTORY_ITEM_STATUS.INITIATE,
    },
    isHold: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
  },
  {
    tableName: "inventory_products",
    timestamps: true,
  }
);

export default InventoryProduct;

InventoryProduct.beforeUpdate((inventoryProduct) => {
  delete inventoryProduct.dataValues.id;
  delete inventoryProduct.dataValues.combinedNumber;
  delete inventoryProduct.dataValues.siplId;
  delete inventoryProduct.dataValues.productId;
}); 