import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

export enum DOCUMENT_NUMBERING_TYPE {
  QUOTATION = "QUOTATION",
  SALES_ORDER = "SALES_ORDER",
  PACKAGING_LIST = "PACKAGING_LIST",
  LOADING_ORDER = "LOADING_ORDER",
  DELIVERY_NOTE = "DELIVERY_NOTE",
  PURCHASE_ORDER = "PURCHASE_ORDER",
  GOODS_RECEIPT = "GOODS_RECEIPT",
  INVOICE = "INVOICE",
  CREDIT_NOTE = "CREDIT_NOTE",
  PAYMENT_RECEIPT = "PAYMENT_RECEIPT",
}

export enum SEQUENCE_RESET_FREQUENCY {
  YEARLY = "YEARLY",
  NEVER = "NEVER",
}

export interface DocumentNumberingConfigAttributes {
  id: number;
  clientId: number;
  documentType: DOCUMENT_NUMBERING_TYPE;
  prefix: string;
  includeYear: boolean;
  separator: string;
  numberLength: number;
  sequenceReset: SEQUENCE_RESET_FREQUENCY;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DocumentNumberingConfigCreationAttributes = Optional<
  DocumentNumberingConfigAttributes,
  "id" | "includeYear" | "separator" | "numberLength" | "sequenceReset" | "createdAt" | "updatedAt"
>;

export interface DocumentNumberingConfigInstance
  extends Model<DocumentNumberingConfigAttributes, DocumentNumberingConfigCreationAttributes>,
    DocumentNumberingConfigAttributes {}

const DocumentNumberingConfig = sequelize.define<DocumentNumberingConfigInstance>(
  "DocumentNumberingConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
    },
    documentType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    prefix: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    includeYear: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    separator: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: "-",
    },
    numberLength: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
    },
    sequenceReset: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: SEQUENCE_RESET_FREQUENCY.YEARLY,
    },
  },
  {
    tableName: "document_numbering_configs",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "documentType"],
      },
    ],
  }
);

(DocumentNumberingConfig as any).scopeConfig = {
  client: true,
  location: false,
};

export default DocumentNumberingConfig;
