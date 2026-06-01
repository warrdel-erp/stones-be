import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";
import Account from "./Account.model";
import Location from "./location.model";
import { ACTIVITY_TYPE, ACTIVITY_REFERENCE_TYPE } from "../constants/tableTypes";

const Activity = sequelize.define(
  "Activity",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    activityType: {
      type: DataTypes.ENUM(...Object.values(ACTIVITY_TYPE)),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(ACTIVITY_REFERENCE_TYPE)),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Location,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "activities",
    timestamps: true,
  }
);

// Scope configuration for Activity model
(Activity as any).scopeConfig = {
  client: true,
  location: false,
};

export default Activity;
