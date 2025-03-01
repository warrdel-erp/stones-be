import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client";
import Location from "./location";

// Define User Model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client, // Table name should match the one in DB
        key: "id",
      },
      onUpdate: "CASCADE", // Update clientId when Client.id changes
      onDelete: "RESTRICT", // Prevent deleting Client if Users exist
    },
    defaultLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;
