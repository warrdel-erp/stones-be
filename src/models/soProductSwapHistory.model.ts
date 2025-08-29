import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import SalesOrderProduct from "./salesOrderProduct.model";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";

const SoProductSwapHistory = sequelize.define(
  "so_product_swap_histories",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    loRemeasureLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    loRemeasureWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    plRemeasureLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    plRemeasureWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    stage: {
      type: DataTypes.ENUM(...Object.values(SALE_ORDER_PRODUCT_STAGES)), // Sales Order, Loading Order, Packaging List
      allowNull: false,
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
