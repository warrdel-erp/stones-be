import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import SIPL from "./sipl.model";
import Product from "./product.model";
import RequestedPurchaseProduct from "./requestedPurchaseProduct";
import * as decimal from '../helper/decimal'

const SIPLProduct = sequelize.define(
  "sipl_products",
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
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    noOfSlabs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    supplierNote: {
      type: DataTypes.TEXT,
    },
    totalCost: {
      type: DataTypes.VIRTUAL,
      get() {
        const quantity = Number(this.get("quantity"));
        const unitCost = Number(this.get("unitPrice"));

        return decimal.decimalMultiply(quantity, unitCost)
      }
    },

    siplId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SIPL,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    requestedPurchaseProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RequestedPurchaseProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "sipl_products",
    timestamps: true,
  }
);

export default SIPLProduct;
