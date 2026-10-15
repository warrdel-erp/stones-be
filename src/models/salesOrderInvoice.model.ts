import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Customer from "./customer.model";
import PackagingList from "./packagingList.model";
import Client from "./client.model";
import * as models from "./index";
import { AppError } from "../helper/appError";
import SalesOrder from "./salesOrder.model";
import * as decimal from '../helper/decimal'
import { scoped } from "../utils/scoped";
import { getNextSequenceNumber } from "../services/sequence.service";
import { SEQUENCE_MODEL } from "../constants/sequenceTypes";

export type SoInvoice = {
  customerId: number;
  packagingListId?: number;
  loadingOrderId?: number;
  clientId: number;
  amount: number;
  salesOrderId: number;
  taxableAmount: number;
  taxValue: number;
  totalServiceCharges: number;
  discountPercentage?: number;
  discountAmount?: number;
  termsAndConditions?: string;
};

const SalesOrderInvoice = sequelize.define(
  "SalesOrderInvoice",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    invoiceCode: {
      type: DataTypes.STRING,
    },
    amount: { // total amount without tax.
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    taxableAmount: { // only amount that has to applied tax.
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    taxValue: { // total tax value as per taxable amount.
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    totalServiceCharges: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    finalAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        const amount = Number(this.get('amount')) || 0;
        const taxValue = Number(this.get('taxValue')) || 0;
        const serviceCharges = Number(this.get('totalServiceCharges')) || 0;
        return decimal.decimalAdd(decimal.decimalAdd(amount, taxValue), serviceCharges);
      }
    },
    soInvoiceNumber: {
      type: DataTypes.INTEGER,
    },
    truckId: {
      type: DataTypes.INTEGER,
    },
    truckAssignedOn: {
      type: DataTypes.DATE,
    },
    clientSoInvoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      references: {
        model: Customer,
        key: "id",
      },
      onUpdate: "CASCADE",
      allowNull: false,
    },
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    packagingListId: {
      type: DataTypes.INTEGER,
      references: {
        model: PackagingList,
        key: "id",
      },
      onUpdate: "CASCADE",
      allowNull: true,
    },
    loadingOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: models.LoadingOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: true,
      defaultValue: 0,
    },
    termsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.Location,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "sales_order_invoices",
    timestamps: true, // Enables createdAt and updatedAt fields
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientSoInvoiceNumber"],
      },
      {
        unique: true,
        fields: ["salesOrderId", "soInvoiceNumber"],
      },
    ],
  }
);

// 🔹 Hook: Auto-Increment `clientSoInvoiceNumber` and `soInvoiceNumber` using locked sequence
SalesOrderInvoice.beforeCreate(async (soInvoice: any, options: any) => {
  if (!soInvoice.clientId) {
    throw new Error("Client ID is required to generate clientSoInvoiceNumber.");
  }

  if (!soInvoice.clientSoInvoiceNumber) {
    soInvoice.clientSoInvoiceNumber = await getNextSequenceNumber({
      clientId: soInvoice.clientId,
      modelName: SEQUENCE_MODEL.SALES_ORDER_INVOICE,
      transaction: options?.transaction,
    });
  }

  // Generate soInvoiceNumber
  if (!soInvoice.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soInvoiceNumber.", 400);
  }

  const salesOrder: any = await SalesOrder.findByPk(soInvoice.salesOrderId, {
    transaction: options?.transaction,
  });

  if (!salesOrder) {
    throw new AppError("sales Order not found", 400);
  }

  if (!soInvoice.soInvoiceNumber) {
    soInvoice.soInvoiceNumber = await getNextSequenceNumber({
      clientId: soInvoice.clientId,
      modelName: SEQUENCE_MODEL.SO_INVOICE,
      scopeKey: String(soInvoice.salesOrderId),
      transaction: options?.transaction,
    });
  }

  soInvoice.invoiceCode = `INV ${salesOrder.clientSoNumber}-${soInvoice.soInvoiceNumber}`;
});

// Scope configuration for SalesOrderInvoice model
(SalesOrderInvoice as any).scopeConfig = {
  client: true,
  location: true,
};

export default SalesOrderInvoice;
