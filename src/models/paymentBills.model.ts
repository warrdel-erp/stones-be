import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Payment from "./payment.model";
import Client from "./client.model";
import Location from "./location.model";
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import SalesOrderInvoice from "./salesOrderInvoice.model";

const PaymentBill = sequelize.define(
  "PaymentBill",
  {
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Payment,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_BILL_REFERENCE_TYPES)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "payment_bills",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["paymentId", "referenceId", "referenceType"], // Ensures a bill is not linked multiple times to the same payment
      },
    ],
  }
);

// Scope configuration for PaymentBill model
(PaymentBill as any).scopeConfig = {
  client: true,
  location: true,
};

export default PaymentBill;


