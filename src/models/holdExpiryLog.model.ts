import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Hold from "./hold.model";
import Account from "./Account.model";
import Client from "./client.model";

const HoldExpiryLog = sequelize.define(
  "HoldExpiryLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    holdId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Hold,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    oldExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    newExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
  },
  {
    tableName: "hold_expiry_logs",
    timestamps: true,
  }
);

export default HoldExpiryLog;
