import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Bill from "./bill.model";
import LedgerAccount from "./ledgerAccount.model";
import Client from "./client.model";
import Location from "./location.model";

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
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "bill_items",
    timestamps: true, // Keeps track of createdAt and updatedAt
  }
);

// Scope configuration for BillItem model
(BillItem as any).scopeConfig = {
  client: true,
  location: true,
};

export default BillItem;
