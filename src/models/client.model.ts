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
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    lastName: {
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
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: "unique_phone_number_constraint",
        msg: "unique phone_number",
      },
    },
    clientType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    tax: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    priceLevel: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    licenseNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    userCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "clients",
    timestamps: true,
  }
);

export default Client;
