import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { TRANSACTION_REFERENCE_TYPES, TRANSACTION_TYPES } from "../constants/tableTypes";
import LedgerAccount from "./ledgerAccount.model";

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2), // Stores exact financial values
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPES)), // Credit or Debit
      allowNull: false,
    },
    ledgerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LedgerAccount, // Assumes LedgerAccount table exists
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable for general transactions
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(TRANSACTION_REFERENCE_TYPES)),
      allowNull: true, // Required only if referenceId is used
    },
  },
  {
    tableName: "transactions",
    timestamps: false,
  }
);

export default Transaction;
