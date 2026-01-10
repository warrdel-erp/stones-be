import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

export type TermsCondition = {
  id?: number;
  details?: string;
  clientId: number;
};

const TermsCondition = sequelize.define(
  "TermsCondition",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "terms_conditions",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId"],
      },
    ],
  }
);

// Scope configuration for TermsCondition model
(TermsCondition as any).scopeConfig = {
  client: true,
  location: false,
};

export default TermsCondition;


