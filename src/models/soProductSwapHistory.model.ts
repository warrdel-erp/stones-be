import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct";
import SalesOrderProduct from "./salesOrderProduct.model";

const SoProductSwapHistory = sequelize.define(
  "so_product_swap_histories",
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
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    salesProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrderProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "so_product_swap_histories",
    timestamps: true,
  }
);

export default SoProductSwapHistory;
