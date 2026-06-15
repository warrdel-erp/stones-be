import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Customer from "./customer.model";
import Product from "./product.model";
import Client from "./client.model";

const CustomerExternalInvoice = sequelize.define(
  "CustomerExternalInvoice",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Product,
        key: "id",
      },
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    item: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    soldAs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    itemType: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lineType: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subCategory: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    group: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priceRange: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    seriesName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kind: {
      type: DataTypes.TEXT,
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
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jobName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salesPerson1: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salesPerson2: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    projManager: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acctType: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acctName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerZone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipToPartyName: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipToCity: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipToState: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shipToZip: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    custType: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    associates: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveryType: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slabs: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    invQty: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      defaultValue: 0,
    },
    uom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    saleTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    totalCost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    margin: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    marginPercentage: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    taxRate: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      defaultValue: 0,
    },
    invoiceType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "sale",
    },
  },
  {
    tableName: "customer_external_invoices",
    timestamps: true,
    paranoid: true,
  }
);

(CustomerExternalInvoice as any).scopeConfig = {
  client: true,
  location: false,
};

export default CustomerExternalInvoice;
