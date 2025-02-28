import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Location from "./location";
import User from "./user";
import Notes from "./note";
import Vendor from "./vendor";

const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    po: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purchaseLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    shipmentLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    supplierId: {
      type: DataTypes.INTEGER,
      references: {
        model: Vendor,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "purchase_order",
    timestamps: true,
  }
);

export default PurchaseOrder;
