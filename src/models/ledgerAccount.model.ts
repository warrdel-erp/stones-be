import { DataTypes } from "sequelize";
import { COA_SUB_HEADERS, LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { sequelize } from "../config/database";
import Client from "./client";

export type LedgerAccount = {
  name?: string;
  clientId: number;
  key?: string;
  type: (typeof LEDGER_ACCOUNT_TYPES)[keyof typeof LEDGER_ACCOUNT_TYPES];
  openingBalance?: number;
  openingDate?: Date;
  subHeaderId: number;
  referenceId?: number;
  referenceType?: (typeof LEDGER_ACCOUNT_REFERENCE_TYPES)[keyof typeof LEDGER_ACCOUNT_REFERENCE_TYPES];
};

const LedgerAccount = sequelize.define(
  "LedgerAccount",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(LEDGER_ACCOUNT_TYPES)),
      allowNull: false,
    },
    openingBalance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    openingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subHeaderId: {
      type: DataTypes.ENUM(...COA_SUB_HEADERS.map((e) => String(e.id))),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null for general accounts, non-null for customer/vendor-specific accounts
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: true, // Null for general accounts, non-null for customer/vendor-specific accounts
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(LEDGER_ACCOUNT_REFERENCE_TYPES)),
      allowNull: true, // Null for general accounts, required if referenceId exists
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
  },
  {
    tableName: "ledger_accounts",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "key"],
      },
    ],
  }
);

LedgerAccount.beforeCreate(async (ledgerAccount: any) => {
  const { subHeaderId } = ledgerAccount;

  // Find the last ledger account under the given subHeaderId
  const lastAccount = (await LedgerAccount.findOne({
    where: { subHeaderId },
    order: [["code", "DESC"]],
  }))?.get({ plain: true });

  if (lastAccount) {
    // If there is a last account, increment its code by 1
    ledgerAccount.code = lastAccount.code + 1;
  } else {
    // If this is the first account under the subHeader, use the subHeader's code
    const subHeader = COA_SUB_HEADERS.find((header) => header.id === subHeaderId);
    if (subHeader) {
      ledgerAccount.code = subHeader.code + 1;
    } else {
      throw new Error(`Invalid subHeaderId: ${subHeaderId}`);
    }
  }
});

export default LedgerAccount;
