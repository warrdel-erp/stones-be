import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import Client from "./client.model";

const InventoryProductMetaData = sequelize.define(
  "InventoryProductMetaData",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InventoryProduct,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    vendorName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "inventory_product_metadata",
    timestamps: true,
  }
);

// Scope configuration for InventoryProductMetaData model
(InventoryProductMetaData as any).scopeConfig = {
  client: true,
};

export default InventoryProductMetaData;
