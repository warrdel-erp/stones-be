import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import PackagingList from "./packagingList.model";
import LoadingOrder from "./loadingOrder.model";
import SalesOrder from "./salesOrder.model";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";

const SalesOrderProduct = sequelize.define(
  "sales_order_products",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    taxPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    taxApplied: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: false,
    },
    picked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
      defaultValue: SALE_ORDER_PRODUCT_STAGES.SALES_ORDER,
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
    loadingOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LoadingOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    packagingListId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PackagingList,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "sales_order_products",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["salesOrderId", "inventoryProductId"],
      },
    ],
  }
);

export default SalesOrderProduct;


// hook to prevent update salesOrderd and inventoryProductId
SalesOrderProduct.beforeUpdate((product: any) => {
  delete product.dataValues.salesOrderId;
  delete product.dataValues.inventoryProductId;
});