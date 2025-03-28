import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct";
import LoadingOrder from "./loadingOrder.model";
import SalesOrderProduct from "./salesOrderProduct.model";

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
    isSwapped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
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
    salesOrderProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrderProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "loading_order_products",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["loadingOrderId", "inventoryProductId"], // Composite unique constraint
      },
      {
        unique: true,
        fields: ["salesOrderProductId"], // Composite unique constraint
      },
    ],
  }
);

// Hook to prevent updating inventoryProductId and salesOrderId by removing them from update payload
LoadingOrderProduct.beforeUpdate((product: any) => {
  delete product.dataValues.salesOrderProductId;
  delete product.dataValues.loadingOrderId;
});

export default LoadingOrderProduct;
