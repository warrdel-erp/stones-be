import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct";
import LoadingOrder from "./loadingOrder.model";

const LoadingOrderProduct = sequelize.define(
  "LoadingOrderProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    remeasureLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    remeasureWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    slabPicked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING,
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
    loadingOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LoadingOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "loading_order_products",
    timestamps: true,
  }
);

export default LoadingOrderProduct;
