import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Payment from "./payment.model";

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
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "payment_bills",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["paymentId", "billId"], // Ensures a bill is not linked multiple times to the same payment
      },
    ],
  }
);

export default PaymentBill;
