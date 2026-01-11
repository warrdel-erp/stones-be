import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

const Location = sequelize.define(
  "Location",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    locationName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contactName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      // validate: { max: 10, min: 10 },
    },
    contactMail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    addressLine: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    long: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: "id",
      },
    },
  },
  {
    tableName: "locations",
    timestamps: true,
  }
);

// Scope configuration for Location model
(Location as any).scopeConfig = {
  client: true,
  location: false,
};

export default Location;
