import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Payment from "./payment.model";
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";

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

export default PaymentBill;
