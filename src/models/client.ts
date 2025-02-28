import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: "unique_email_constraint",
        msg: "unique email",
      },
      validate: {
        isEmail: true,
      },
    },
    locationShortName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    clientType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    tax: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    priceLevel: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paymentTerms: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    licenseNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    userCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "clients",
    timestamps: true,
  }
);

export default Client;
