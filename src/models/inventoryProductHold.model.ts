import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import Client from "./client.model";
import Hold from "./hold.model";

const InventoryProductHold = sequelize.define(
  "InventoryProductHold",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    holdId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Hold,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // One-to-one relationship: one hold per inventory product
      references: {
        model: InventoryProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    tableName: "inventory_product_holds",
    timestamps: true,
  }
);

// Scope configuration for InventoryProductHold model
(InventoryProductHold as any).scopeConfig = {
  client: true,
  location: false,
};

export default InventoryProductHold;
