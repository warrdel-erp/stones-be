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

export type SoInvoice = {
  customerId: number;
  packagingListId: number;
  clientId: number;
  amount: number;
  salesOrderId: number;
  taxableAmount: number;
  taxValue: number;
  totalServiceCharges: number;
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
      allowNull: false,
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

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
SalesOrderInvoice.beforeCreate(async (soInvoice: any) => {
  if (!soInvoice.clientId && !soInvoice.purchaseOrderId) {
    throw new Error("Client ID is required to generate clientSoInvoiceNumber.");
  }

  const lastSoInvoiceAccordingToClient: any = await scoped(SalesOrderInvoice).findOne({
    where: { clientId: soInvoice.clientId },
    order: [["clientSoInvoiceNumber", "DESC"]],
  });

  soInvoice.clientSoInvoiceNumber = lastSoInvoiceAccordingToClient
    ? Number(lastSoInvoiceAccordingToClient.clientSoInvoiceNumber) + 1
    : 1;

  //  Generate soInvoiceNumber
  if (!soInvoice.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soInvoiceNumber.", 400);
  }

  const lastInvAccordingToSo: any = await scoped(SalesOrderInvoice).findOne({
    where: { salesOrderId: soInvoice.salesOrderId },
    order: [["soInvoiceNumber", "DESC"]],
  });

  const salesOrder: any = await SalesOrder.findByPk(soInvoice.salesOrderId);

  if (!salesOrder) {
    throw new AppError("sales Order not found", 400);
  }

  soInvoice.soInvoiceNumber = lastInvAccordingToSo ? lastInvAccordingToSo.soInvoiceNumber + 1 : 1;
  soInvoice.invoiceCode = `INV ${salesOrder.clientSoNumber}-${soInvoice.soInvoiceNumber}`;
});

// Scope configuration for SalesOrderInvoice model
(SalesOrderInvoice as any).scopeConfig = {
  client: true,
  location: true,
};

export default SalesOrderInvoice;
