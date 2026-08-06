import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SIPL from "./sipl.model";
import SIPLProduct from "./siplProduct.model";
import Client from "./client.model";
import Location from "./location.model";

const TempAiExtractedSiplItem = sequelize.define(
  "temp_ai_extracted_sipl_items",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    siplId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SIPL,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    siplProductId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SIPLProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    extractedData: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "discarded"),
      allowNull: false,
      defaultValue: "pending",
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Client,
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
    tableName: "temp_ai_extracted_sipl_items",
    timestamps: true,
  }
);

// Scope configuration for TempAiExtractedSiplItem model
(TempAiExtractedSiplItem as any).scopeConfig = {
  client: true,
  location: true,
};

export default TempAiExtractedSiplItem;
