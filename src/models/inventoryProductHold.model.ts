import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import Account from "./Account.model";
import Customer from "./customer.model";
import Client from "./client.model";
import Location from "./location.model";

const InventoryProductHold = sequelize.define(
  "InventoryProductHold",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Customer,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
    tableName: "inventory_product_holds",
    timestamps: true,
  }
);

// Scope configuration for InventoryProductHold model
(InventoryProductHold as any).scopeConfig = {
  client: true,
  location: true,
};

export default InventoryProductHold;