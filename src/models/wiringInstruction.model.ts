import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Vendor from "./vendor.model";
import Client from "./client.model";
import Account from "./Account.model";

const WiringInstruction = sequelize.define(
  "WiringInstruction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    swiftCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Vendor,
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
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    tableName: "wiring_instructions",
    timestamps: true,
  }
);

// Scope configuration for WiringInstruction model
(WiringInstruction as any).scopeConfig = {
  client: true,
  location: false,
};

export default WiringInstruction;
