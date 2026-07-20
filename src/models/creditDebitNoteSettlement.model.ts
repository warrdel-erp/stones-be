import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import CreditDebitNote from "./creditDebitNote.model";
import SIPL from "./sipl.model";
import Client from "./client.model";

const CreditDebitNoteSettlement = sequelize.define(
  "CreditDebitNoteSettlement",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    creditDebitNoteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CreditDebitNote,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    referenceType: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "credit_debit_note_settlements",
    timestamps: true,
  }
);

// Scope configuration for CreditDebitNoteSettlement model
(CreditDebitNoteSettlement as any).scopeConfig = {
  client: true,
  location: false,
};

export default CreditDebitNoteSettlement;
