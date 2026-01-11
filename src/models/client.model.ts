import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";

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
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.get('firstName') + ' ' + this.get('lastName')
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
    userCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    defaultLocationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "locations",
        key: "id",
      },
    },
  },
  {
    tableName: "clients",
    timestamps: true,
  }
);


export default Client;
