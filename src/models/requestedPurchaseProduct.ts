import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import PurchaseOrder from "./purchaseOrder.model";
import Product from "./product.model";
import Client from "./client.model";
import * as models from "./index";

const RequestedPurchaseProduct = sequelize.define(
  "requested_purchase_products",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    noOfSlabs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
    },
    supplierNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
        model: models.Location,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "requested_purchase_products",
    timestamps: true,
  }
);

// Hook to prevent updating productId and purchaseOrderId by removing them from update payload
RequestedPurchaseProduct.beforeUpdate((product: any, options) => {
  delete product.dataValues.productId;
  delete product.dataValues.purchaseOrderId;
});

// Scope configuration for RequestedPurchaseProduct model
(RequestedPurchaseProduct as any).scopeConfig = {
  client: true,
  location: true,
};

export default RequestedPurchaseProduct;
