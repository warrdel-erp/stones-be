import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { PAYEE_TYPE, PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_TYPE } from "../constants/tableTypes";
import User from "./user";

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
    transactionId: {
      type: DataTypes.STRING,
      unique: {
        name: "unique_transaction_constraint",
        msg: "unique transaction",
      },
      allowNull: false,
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
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

export default Payment;
