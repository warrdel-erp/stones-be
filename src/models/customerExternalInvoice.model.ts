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
      type: DataTypes.STRING,
      allowNull: true,
    },
    soldAs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    itemType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lineType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priceRange: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seriesName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kind: {
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
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jobName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salesPerson1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salesPerson2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    projManager: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    acctType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    acctName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerZone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipToPartyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipToCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipToState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipToZip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    custType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    associates: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slabs: {
      type: DataTypes.STRING,
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
