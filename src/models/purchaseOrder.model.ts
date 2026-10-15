import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Location from "./location.model";
import User from "./user.model";
import Vendor from "./vendor.model";
import Client from "./client.model";
import * as models from "./index";
import { PO_STATUS } from "../constants/tableTypes";
import { PAYMENT_TERMS } from "../constants";
import { AppError } from "../helper/appError";
import { allocateDocumentSequenceAndCode } from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "./documentNumberingConfig.model";

const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    poDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clientPoNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
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
    status: {
      type: DataTypes.ENUM(...Object.values(PO_STATUS)),
      defaultValue: PO_STATUS.OPEN,
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: models.Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    shipmentLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    supplierId: {
      type: DataTypes.INTEGER,
      references: {
        model: Vendor,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    shipDate: {
      type: DataTypes.DATE,
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
    container: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
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
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "purchase_orders",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientPoNumber"],
      },
      {
        unique: true,
        fields: ["clientId", "code"],
      },
    ],
  }
);

// 🔹 Hook: Prevent updating clientPoNumber or code (immutable)
PurchaseOrder.beforeUpdate(async (purchaseOrder: any) => {
  if (purchaseOrder.changed("clientPoNumber") || purchaseOrder.changed("code")) {
    throw new AppError("Purchase Order number and code are immutable and cannot be updated.", 400);
  }
});

// 🔹 Hook: Auto-Increment `clientPoNumber` and format `code` using locked sequence
PurchaseOrder.beforeCreate(async (purchaseOrder: any, options: any) => {
  if (!purchaseOrder.clientId) {
    throw new AppError("Client ID is required to generate clientPoNumber.", 400);
  }

  if (!purchaseOrder.clientPoNumber || !purchaseOrder.code) {
    const { sequenceNumber, code } = await allocateDocumentSequenceAndCode({
      clientId: purchaseOrder.clientId,
      documentType: DOCUMENT_NUMBERING_TYPE.PURCHASE_ORDER,
      transaction: options?.transaction,
    });
    if (!purchaseOrder.clientPoNumber) purchaseOrder.clientPoNumber = sequenceNumber;
    if (!purchaseOrder.code) purchaseOrder.code = code;
  }
});

// Scope configuration for PurchaseOrder model
(PurchaseOrder as any).scopeConfig = {
  client: true,
  location: true,
};

export default PurchaseOrder;
