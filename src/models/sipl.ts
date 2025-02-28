import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user";
import PurchaseOrder from "./purchaseOrder";

const SIPL = sequelize.define(
  "SIPL",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    container: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    supplierNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
  },
  {
    tableName: "sipl",
    timestamps: true,
  }
);

export default SIPL;
