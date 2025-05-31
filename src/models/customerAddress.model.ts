import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Customer from "./customer.model";
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
    suit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  },
  {
    tableName: "customer_addresses",
    timestamps: true,
  }
);

export default CustomerAddress;
