import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import PurchaseOrder from "./purchaseOrder.model";
import Client from "./client.model";
import Location from "./location.model";
import { AppError } from "../helper/appError";
import { allocateDocumentSequenceAndCode } from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "./documentNumberingConfig.model";
import { PAYMENT_TERMS } from "../constants";
import { SIPL_STATUS } from "../constants/tableTypes";

const SIPL = sequelize.define(
  "SIPL",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientInvoiceNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    shipDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clientInvoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    poSiplNumber: {
      type: DataTypes.INTEGER,
      allowNull: false, // Auto-Incremented and not null is handled in hook
    },
    invoiceCode: {
      type: DataTypes.STRING,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    supplierInvoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supplierInvoiceDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    poDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    etaDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveryType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipmentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    supplierNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SIPL_STATUS)),
      allowNull: false,
      defaultValue: SIPL_STATUS.PENDING,
    },
    paymentTermId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentTerm: {
      type: DataTypes.VIRTUAL,
      get() {
        return PAYMENT_TERMS.find((e) => e.id === this.get("paymentTermId"));
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    updatedBy: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    inventoryReceived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    receivedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    shipmentLocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    s3FileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Reference to the s3_files record for the SIPL document",
    },
  },
  {
    tableName: "sipls",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientInvoiceNumber"],
      },
      {
        unique: true,
        fields: ["clientId", "invoiceCode"],
      },
      {
        unique: true,
        fields: ["purchaseOrderId", "poSiplNumber"],
      },
    ],
  }
);

// 🔹 Hook: Prevent updating clientInvoiceNumber or invoiceCode (immutable)
SIPL.beforeUpdate(async (sipl: any) => {
  if (sipl.changed("clientInvoiceNumber") || sipl.changed("invoiceCode")) {
    throw new AppError("Goods Receipt invoice number and code are immutable and cannot be updated.", 400);
  }
});

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` and format `invoiceCode` using locked sequence
SIPL.beforeCreate(async (sipl: any, options: any) => {
  if (!sipl.clientId) {
    throw new AppError("Client ID is required to generate clientInvoiceNumber.", 400);
  }

  if (!sipl.clientInvoiceNumber || !sipl.invoiceCode) {
    const { sequenceNumber, code } = await allocateDocumentSequenceAndCode({
      clientId: sipl.clientId,
      documentType: DOCUMENT_NUMBERING_TYPE.GOODS_RECEIPT,
      transaction: options?.transaction,
    });
    if (!sipl.clientInvoiceNumber) sipl.clientInvoiceNumber = sequenceNumber;
    if (!sipl.invoiceCode) sipl.invoiceCode = code;
  }
});

// Scope configuration for SIPL model
(SIPL as any).scopeConfig = {
  client: true,
  location: true,
};

export default SIPL;

