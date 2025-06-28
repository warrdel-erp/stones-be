import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import {
  JOURNAL_ENTRY_FOR_TYPES,
  JOURNAL_ENTRY_PROCESS_TYPE,
  JOURNAL_ENTRY_REFERENCE_TYPES,
  JOURNAL_ENTRY_SUB_REFERENCE_TYPES,
  JOURNAL_ENTRY_TYPE,
} from "../constants/tableTypes";
import LedgerAccount from "./ledgerAccount.model";
import User from "./user.model";
import Location from "./location";

export type JournalEntry = {
  amount: number;
  type: (typeof JOURNAL_ENTRY_TYPE)[keyof typeof JOURNAL_ENTRY_TYPE];
  ledgerId: number;
  processType?: (typeof JOURNAL_ENTRY_PROCESS_TYPE)[keyof typeof JOURNAL_ENTRY_PROCESS_TYPE];
  referenceId?: number;
  referenceType?: (typeof JOURNAL_ENTRY_REFERENCE_TYPES)[keyof typeof JOURNAL_ENTRY_REFERENCE_TYPES];
  subReferenceId?: number;
  subReferenceType?: (typeof JOURNAL_ENTRY_SUB_REFERENCE_TYPES)[keyof typeof JOURNAL_ENTRY_SUB_REFERENCE_TYPES];
  entryFor?: (typeof JOURNAL_ENTRY_FOR_TYPES)[keyof typeof JOURNAL_ENTRY_FOR_TYPES];
  entryForId?: number,
  locationId: number,
  partyLedgerAccountId: number | null
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
        model: LedgerAccount,
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    partyLedgerAccountId: {
      type: DataTypes.INTEGER,
      references: {
        model: LedgerAccount,
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    processType: {
      type: DataTypes.ENUM(...Object.values(JOURNAL_ENTRY_PROCESS_TYPE)),
      allowNull: true,
    },
    subReferenceId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable for general transactions
    },
    subReferenceType: {
      type: DataTypes.ENUM(...Object.values(JOURNAL_ENTRY_SUB_REFERENCE_TYPES)),
      allowNull: true, // Required only if referenceId is used
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable for general transactions
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(JOURNAL_ENTRY_REFERENCE_TYPES)),
      allowNull: true, // Required only if referenceId is used
    },
    entryFor: {
      type: DataTypes.ENUM(...Object.values(JOURNAL_ENTRY_FOR_TYPES)),
      allowNull: true
    },
    entryForId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    }
  },
  {
    tableName: "journal_entry",
    timestamps: true,
  }
);

// Hook to calculate balance before creating a new JournalEntry
JournalEntry.beforeCreate(async (entry: any, { transaction }) => {
  // Get the last entry for this ledgerId, ordered by createdAt DESC
  const lastEntry = await JournalEntry.findOne({
    where: { ledgerId: entry.ledgerId },
    transaction,
    order: [["createdAt", "DESC"]],
  });

  let lastBalance: number;
  if (lastEntry) {
    const lastEntryPlain = lastEntry.get({ plain: true });
    lastBalance = lastEntryPlain.balance;
  } else {
    // If no previous entry, get openingBalance from LedgerAccount
    const ledger = await LedgerAccount.findByPk(entry.ledgerId, { transaction });
    const ledgerPlain = ledger ? ledger.get({ plain: true }) : null;
    lastBalance = ledgerPlain ? parseFloat(ledgerPlain.openingBalance) : 0;
  }

  // Add or subtract based on type
  const amount = parseFloat(entry.amount);
  if (entry.type === JOURNAL_ENTRY_TYPE.DR) {
    entry.balance = lastBalance + amount;
  } else if (entry.type === JOURNAL_ENTRY_TYPE.CR) {
    entry.balance = lastBalance - amount;
  }
});

export default JournalEntry;