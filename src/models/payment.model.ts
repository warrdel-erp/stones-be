import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { PAYEE_TYPE, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_TYPE } from "../constants/tableTypes";
import User from "./user";
import Client from "./client";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    paymentType: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_TYPE)), // incoming = received, outgoing = made
      allowNull: false,
    },
    payeeId: {
      type: DataTypes.INTEGER,
      allowNull: false, // The ID of the entity receiving/sending payment
    },
    payeeType: {
      type: DataTypes.ENUM(...Object.values(PAYEE_TYPE)), // Future-proofing
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD)),
      allowNull: false,
    },
    clientTransactionNo: {
      type: DataTypes.INTEGER,
      allowNull: true, // not null handled by hook
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
    tableName: "payments",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientTransactionNo"],
      },
    ],
  }
);

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
Payment.beforeCreate(async (payment: any) => {
  if (!payment.clientId) {
    throw new Error("Client ID is required to generate transaction number");
  }

  console.log("object", payment);

  const lastSIPLAccordingToPO: any = await Payment.findOne({
    where: { clientId: payment.clientId },
    order: [["clientTransactionNo", "DESC"]],
  });

  payment.clientTransactionNo = lastSIPLAccordingToPO ? lastSIPLAccordingToPO.clientTransactionNo + 1 : 1;
});

export default Payment;
