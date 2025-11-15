import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import User from "./user.model";
import Account from "./Account.model";

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
  },
  {
    tableName: "inventory_product_holds",
    timestamps: true,
  }
);

export default InventoryProductHold;

