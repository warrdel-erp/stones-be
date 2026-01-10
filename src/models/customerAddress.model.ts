import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Customer from "./customer.model";
import Client from "./client.model";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";

const CustomerAddress = sequelize.define(
  "CustomerAddress",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressLine: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactName: {
      type: DataTypes.STRING(255),
    },
    contactEmail: {
      type: DataTypes.STRING(255),
    },
    contactNumber: {
      type: DataTypes.STRING(15),
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    long: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    addressType: {
      type: DataTypes.ENUM(...Object.values(CUSTOMER_ADDRESS_TYPES)),
      allowNull: false,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Customer,
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
  },
  {
    tableName: "customer_addresses",
    timestamps: true,
  }
);

// Scope configuration for CustomerAddress model
(CustomerAddress as any).scopeConfig = {
  client: true,
  location: false,
};

export default CustomerAddress;
