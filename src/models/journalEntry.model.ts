import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { JOURNAL_ENTRY_PROCESS_TYPE, JOURNAL_ENTRY_REFERENCE_TYPES, JOURNAL_ENTRY_TYPE } from "../constants/tableTypes";
import LedgerAccount from "./ledgerAccount.model";

export type JournalEntry = {
  amount: number;
  type: (typeof JOURNAL_ENTRY_TYPE)[keyof typeof JOURNAL_ENTRY_TYPE];
  ledgerId: number;
  referenceId?: number;
  processType: (typeof JOURNAL_ENTRY_PROCESS_TYPE)[keyof typeof JOURNAL_ENTRY_PROCESS_TYPE];
  referenceType?: (typeof JOURNAL_ENTRY_REFERENCE_TYPES)[keyof typeof JOURNAL_ENTRY_REFERENCE_TYPES];
};

const JournalEntry = sequelize.define(
  "JournalEntry",
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
      type: DataTypes.ENUM(...Object.values(JOURNAL_ENTRY_TYPE)), // Credit or Debit
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
    processType: {
      type: DataTypes.ENUM(...Object.values(JOURNAL_ENTRY_PROCESS_TYPE)),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable for general transactions
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(JOURNAL_ENTRY_REFERENCE_TYPES)),
      allowNull: true, // Required only if referenceId is used
    },
  },
  {
    tableName: "journal_entry",
    timestamps: true,
  }
);

export default JournalEntry;
