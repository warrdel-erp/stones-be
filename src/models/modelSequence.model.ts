import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

export interface ModelSequenceAttributes {
  id?: number;
  clientId: number;
  modelName: string;
  scopeKey: string;
  lastNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ModelSequenceInstance
  extends Model<ModelSequenceAttributes>,
    ModelSequenceAttributes {}

const ModelSequence = sequelize.define<ModelSequenceInstance>(
  "ModelSequence",
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
    modelName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    scopeKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "GLOBAL",
    },
    lastNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "model_sequences",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "modelName", "scopeKey"],
      },
    ],
  }
);

(ModelSequence as any).scopeConfig = {
  client: true,
  location: false,
};

export default ModelSequence;
