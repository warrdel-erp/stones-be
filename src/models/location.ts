import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client";

const Location = sequelize.define(
  "Location",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    location: {
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
      validate: { max: 10, min: 10 },
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
    suite: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
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

export default Location;
