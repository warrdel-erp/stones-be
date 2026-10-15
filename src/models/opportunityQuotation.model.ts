import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { allocateDocumentSequenceAndCode } from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "./documentNumberingConfig.model";

const OpportunityQuotation = sequelize.define(
  "OpportunityQuotation",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    opportunityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientQuoteNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quoteNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "DRAFT",
    },
    supersededByHoldId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    grandTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validityDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "opportunity_quotations",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientQuoteNumber"],
      },
      {
        unique: true,
        fields: ["clientId", "code"],
      },
    ],
  }
);

// 🔹 Hook: Prevent updating clientQuoteNumber or code (immutable)
OpportunityQuotation.beforeUpdate(async (quotation: any) => {
  if (quotation.changed("clientQuoteNumber") || quotation.changed("code")) {
    throw new AppError("Quotation number and code are immutable and cannot be updated.", 400);
  }
});

// 🔹 Hook: Auto-Increment `clientQuoteNumber` and format `code` using locked sequence
OpportunityQuotation.beforeCreate(async (quotation: any, options: any) => {
  if (!quotation.clientId) {
    throw new AppError("Client ID is required to generate quotation number.", 400);
  }

  if (!quotation.clientQuoteNumber || !quotation.code) {
    const { sequenceNumber, code } = await allocateDocumentSequenceAndCode({
      clientId: quotation.clientId,
      documentType: DOCUMENT_NUMBERING_TYPE.QUOTATION,
      transaction: options?.transaction,
    });
    if (!quotation.clientQuoteNumber) quotation.clientQuoteNumber = sequenceNumber;
    if (!quotation.code) quotation.code = code;
  }
});

(OpportunityQuotation as any).scopeConfig = {
  client: true,
  location: false,
};

export default OpportunityQuotation;

