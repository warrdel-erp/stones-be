import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Bill from "./bill";
import LedgerAccount from "./ledgerAccount.model";

const BillItem = sequelize.define(
  "billItems",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    service: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ledgerAccountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LedgerAccount,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    billId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Bill,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "bill_items",
    timestamps: true, // Keeps track of createdAt and updatedAt
  }
);

export default BillItem;
