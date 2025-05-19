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
    phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: "unique_phone_number_constraint",
        msg: "unique phone_number",
      },
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
