import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user";
import * as models from "../models";
import CustomerAddress from "./customerAddress.model";

const SalesOrder = sequelize.define(
  "SalesOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    soDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    customerPo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialInstruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending", // Example: pending, confirmed, shipped, completed, canceled
    },
    taxId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.Customer,
        key: "id",
      },
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CustomerAddress,
        key: "id",
      },
    },
  },
  {
    tableName: "sales_orders",
    timestamps: true,
  }
);

export default SalesOrder;
