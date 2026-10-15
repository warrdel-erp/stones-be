import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";
import * as models from "../models";
import CustomerAddress from "./customerAddress.model";
import { DELIVERY_TYPES, SALES_ORDER_STATUS } from "../constants/tableTypes";
import { PAYMENT_TERMS, SALES_TAX } from "../constants";
import { AppError } from "../helper/appError";
import { allocateDocumentSequenceAndCode } from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "./documentNumberingConfig.model";

const SalesOrder = sequelize.define(
  "SalesOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientSoNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    soDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    customerPo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SALES_ORDER_STATUS)),
      allowNull: false,
      defaultValue: SALES_ORDER_STATUS.OPEN,
    },
    deliveryType: {
      type: DataTypes.ENUM(...Object.values(DELIVERY_TYPES)),
      allowNull: false,
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTermId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerPoDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.Customer,
        key: "id",
      },
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CustomerAddress,
        key: "id",
      },
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },

    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: models.Client,
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.Location,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    holdId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: models.Hold,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    quotationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: models.OpportunityQuotation,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    taxId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tax: {
      type: DataTypes.VIRTUAL,
      get() {
        return SALES_TAX.find((e: any) => e.id === this.get("taxId"));
      },
    },
    paymentTerm: {
      type: DataTypes.VIRTUAL,
      get() {
        return PAYMENT_TERMS.find((e) => e.id === this.get("paymentTermId"));
      },
    }
  },
  {
    tableName: "sales_orders",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientSoNumber"],
      },
      {
        unique: true,
        fields: ["clientId", "code"],
      },
    ],
  }
);

// 🔹 Hook: Prevent updating clientSoNumber or code (immutable)
SalesOrder.beforeUpdate(async (salesOrder: any) => {
  if (salesOrder.changed("clientSoNumber") || salesOrder.changed("code")) {
    throw new AppError("Sales Order number and code are immutable and cannot be updated.", 400);
  }
});

// 🔹 Hook: Auto-Increment `clientSoNumber` and format `code` using locked sequence
SalesOrder.beforeCreate(async (salesOrder: any, options: any) => {
  if (!salesOrder.clientId) {
    throw new AppError("Client ID is required to generate clientSoNumber.", 400);
  }

  if (!salesOrder.clientSoNumber || !salesOrder.code) {
    const { sequenceNumber, code } = await allocateDocumentSequenceAndCode({
      clientId: salesOrder.clientId,
      documentType: DOCUMENT_NUMBERING_TYPE.SALES_ORDER,
      transaction: options?.transaction,
    });
    if (!salesOrder.clientSoNumber) salesOrder.clientSoNumber = sequenceNumber;
    if (!salesOrder.code) salesOrder.code = code;
  }
});

// Scope configuration for SalesOrder model
(SalesOrder as any).scopeConfig = {
  client: true,
  location: true,
};

export default SalesOrder;
