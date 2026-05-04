import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Customer from "./customer.model";
import Location from "./location.model";
import User from "./user.model";
import Client from "./client.model";

const CustomerTransaction = sequelize.define(
  "ExternalCustomerTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    trxType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    custType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    custPoNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salesRepId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    terms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    daysPastInvoiceDate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    daysPastDue: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    aging0To30: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    aging31To45: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    aging46To60: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    agingOver60: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    balanceDue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
    },
  },
  {
    tableName: "external_customer_transactions",
    timestamps: true,
    paranoid: true,
  }
);

(CustomerTransaction as any).scopeConfig = {
  client: true,
  location: true,
};

export default CustomerTransaction;
