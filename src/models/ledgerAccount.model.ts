import { CreateOptions, DataTypes, Transaction } from "sequelize";
import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES, LEDGER_ACCOUNT_TYPES } from "../constants/coa";
import { LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { sequelize } from "../config/database";
import Client from "./client.model";
import { scoped } from "../utils/scoped";

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
  parentId?: number | null;
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
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "ledger_accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
    subHeader: {
      type: DataTypes.VIRTUAL,
      get() {
        return COA_SUB_HEADERS.find((subHeader) => subHeader.id === Number(this.get("subHeaderId")));
      }
    },
    header: {
      type: DataTypes.VIRTUAL,
      get() {
        const subHeader: any = this.get("subHeader");
        return COA_HEADERS.find((header) => header.id === Number(subHeader?.parent_id));
      }
    },
    parentType: {
      type: DataTypes.VIRTUAL,
      get() {
        const header: any = this.get("header");
        return COA_TYPES.find((type) => type.id === Number(header?.parent_id));
      }
    }

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

LedgerAccount.beforeSave(async (ledgerAccount: any, options: any) => {
  if (ledgerAccount.parentId) {
    // Check if parent has a parent (cannot have multiple levels)
    const parent = await LedgerAccount.findByPk(ledgerAccount.parentId, { transaction: options.transaction });
    if (parent && parent.getDataValue("parentId")) {
      throw new Error("A child ledger cannot have a parent which is also a child.");
    }

  }
});

LedgerAccount.beforeCreate(async (ledgerAccount: any, options: CreateOptions<any>) => {
  await assignLedgerAccountCode(ledgerAccount, options.transaction);
});

async function assignLedgerAccountCode(ledgerAccount: any, transaction?: Transaction | null) {
  const { subHeaderId } = ledgerAccount;

  // Lock the table to prevent concurrent writes
  const lastAccount = (await scoped(LedgerAccount).findOne({
    where: { subHeaderId },
    order: [["code", "DESC"]],
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined, // Use row-level lock within the transaction
  }))?.get({ plain: true });

  if (lastAccount) {
    // If there is a last account, increment its code by 1
    ledgerAccount.code = lastAccount.code + 1;
  } else {
    // If this is the first account under the subHeader, use the subHeader's code
    const subHeader = COA_SUB_HEADERS.find((header) => header.id == subHeaderId);
    if (subHeader) {
      ledgerAccount.code = subHeader.code + 1;
    } else {
      throw new Error(`Invalid subHeaderId: ${subHeaderId}`);
    }
  }
}

// Scope configuration for LedgerAccount model
(LedgerAccount as any).scopeConfig = {
  client: true,
  location: false,
};

export default LedgerAccount;
