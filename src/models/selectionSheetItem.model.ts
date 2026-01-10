import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SelectionSheet from "./selectionSheet.model";
import InventoryProduct from "./inventoryProduct.model";
import Client from "./client.model";
import Location from "./location.model";

const SelectionSheetItem = sequelize.define(
  "SelectionSheetItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    selectionSheetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SelectionSheet,
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
    tableName: "selection_sheet_items",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["selectionSheetId", "inventoryProductId"],
      },
    ],
  }
);

// Scope configuration for SelectionSheetItem model
(SelectionSheetItem as any).scopeConfig = {
  client: true,
  location: true,
};

export default SelectionSheetItem;

