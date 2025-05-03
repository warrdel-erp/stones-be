import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Customer from "./customer.model";
import LoadingOrder from "./loadingOrder.model";
import Client from "./client";
import { AppError } from "../helper/appError";
import SalesOrder from "./salesOrder.model";

export type SoInvoice = {
  customerId: number;
  loadingOrderId: number;
  clientId: number;
  amount: number;
  salesOrderId: number
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
      type: DataTypes.STRING
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    soInvoiceNumber: {
      type: DataTypes.INTEGER
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
    loadingOrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: LoadingOrder,
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

  const lastSoInvoiceAccordingToClient: any = await SalesOrderInvoice.findOne({
    where: { clientId: soInvoice.clientId },
    order: [["clientSoInvoiceNumber", "DESC"]],
  });

  soInvoice.clientSoInvoiceNumber = lastSoInvoiceAccordingToClient
    ? lastSoInvoiceAccordingToClient.clientSoInvoiceNumber + 1
    : 1;

  //  Generate soInvoiceNumber
  if (!soInvoice.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soInvoiceNumber.", 400);
  }

  const lastInvAccordingToSo: any = await SalesOrderInvoice.findOne({
    where: { salesOrderId: soInvoice.salesOrderId },
    order: [["soInvoiceNumber", "DESC"]],
  });

  const salesOrder: any = await SalesOrder.findByPk(soInvoice.salesOrderId)

  soInvoice.soInvoiceNumber = lastInvAccordingToSo ? lastInvAccordingToSo.soInvoiceNumber + 1 : 1;
  soInvoice.invoiceCode = `INV ${salesOrder.clientSoNumber}-${soInvoice.soInvoiceNumber}`;

});

export default SalesOrderInvoice;
