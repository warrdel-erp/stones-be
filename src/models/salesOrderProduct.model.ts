import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";
import InventoryProduct from "./inventoryProduct";

const SalesOrderProduct = sequelize.define(
  "SalesOrderProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    taxApplied: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "sales_order_products",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["salesOrderId", "inventoryProductId"], // Composite unique constraint
      },
    ],
  }
);

// Hook to prevent updating inventoryProductId and salesOrderId by removing them from update payload
SalesOrderProduct.beforeUpdate((product: any) => {
  delete product.dataValues.inventoryProductId;
  delete product.dataValues.salesOrderId;
});

export default SalesOrderProduct;
