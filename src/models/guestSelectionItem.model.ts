import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import GuestSelection from "./guestSelection.model";
import InventoryProduct from "./inventoryProduct.model";

const GuestSelectionItem = sequelize.define(
  "GuestSelectionItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    guestSelectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: GuestSelection,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InventoryProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    tableName: "guest_selection_items",
    timestamps: true,
  }
);

export default GuestSelectionItem;
