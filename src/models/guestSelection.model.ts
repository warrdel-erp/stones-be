import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

const GuestSelection = sequelize.define(
  "GuestSelection",
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
      onDelete: "RESTRICT",
    },
    guestName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    guestMobile: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    guestEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    choiceDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "reviewed", "converted", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "guest_selections",
    timestamps: true,
  }
);

// Scope configuration for GuestSelection model
(GuestSelection as any).scopeConfig = {
  client: true,
};

export default GuestSelection;
