import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import SIPL from "./sipl";
import Product from "./product";

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
    description: {
      type: DataTypes.TEXT,
    },
    supplierNote: {
      type: DataTypes.TEXT,
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "sipl_products",
    timestamps: false,
  }
);

export default SIPLProduct;
