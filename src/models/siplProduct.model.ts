import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import SIPL from "./sipl.model";
import Product from "./product.model";
import RequestedPurchaseProduct from "./requestedPurchaseProduct";
import Client from "./client.model";
import * as models from "./index";
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
    tableName: "sipl_products",
    timestamps: true,
  }
);

// Scope configuration for SIPLProduct model
(SIPLProduct as any).scopeConfig = {
  client: true,
  location: true,
};

export default SIPLProduct;
