import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";
import Location from "./location.model";
import Account from "./Account.model";
import { USER_ROLES } from "../constants/tableTypes";

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
      unique: {
        name: "unique_user_id_constraint",
        msg: "unique user_id",
      },
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "unique_phone_number_constraint",
        msg: "unique phone_number",
      },
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    defaultLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLES)),
      allowNull: false,
      defaultValue: USER_ROLES.ADMIN,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

// Scope configuration for User model
(User as any).scopeConfig = {
  client: true,
  location: false,
};

export default User;
