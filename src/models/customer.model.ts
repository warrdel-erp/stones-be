import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import { SALES_TAX, SCOP, PAYMENT_TERMS } from "../constants";
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from "../constants/tableTypes";
import Client from "./client.model";

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(CUSTOMER_TYPE)),
      allowNull: false,
      defaultValue: CUSTOMER_TYPE.CUSTOMER,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    printName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primaryPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    secondaryPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    landlineNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fax: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priceLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxExempt: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    salesTaxId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    salesTax: {
      type: DataTypes.VIRTUAL,
      get() {
        return SALES_TAX.find((e: any) => e.id === this.get("salesTaxId"));
      },
    },
    paymentTermId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentTerm: {
      type: DataTypes.VIRTUAL,
      get() {
        return PAYMENT_TERMS.find((e) => e.id === this.get("paymentTermId"));
      },
    },
    exemptCerti: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exemptExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    poRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    applyFinanceCharges: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    preferredDocSend: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    daysForGrace: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    daysForHold: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerSince: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    einNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CUSTOMER_STATUS)),
      allowNull: false,
      defaultValue: CUSTOMER_STATUS.ACTIVE,
    },
    scopeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    scope: {
      type: DataTypes.VIRTUAL,
      get() {
        return SCOP.find((e) => e.id === this.get("scopeId"));
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client, // Table name should match the one in DB
        key: "id",
      },
      onUpdate: "CASCADE", // Update clientId when Client.id changes
      onDelete: "RESTRICT", // Prevent deleting Client if Users exist
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    primarySalesPersonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    imageFileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Reference to the s3_files record for this customer's image",
    },
  },
  {
    tableName: "customers",
    timestamps: true,
    paranoid: true, // Enables soft delete
    indexes: [
      { unique: true, fields: ["primaryPhoneNumber", "clientId"], name: "unique_primary_phone_per_client" },
      { unique: true, fields: ["customerCode", "clientId"], name: "unique_customer_code_per_client" },
    ],
  }
);

// 🔹 Hook: Auto-Increment customerCode based on clientId
Customer.beforeValidate(async (customer: any) => {
  if (!customer.clientId) {
    throw new Error("Client ID is required to generate customerCode.");
  }

  // If customerCode is empty, auto-generate it
  if (!customer.customerCode) {
    // Use Sequelize functions to get the max numeric customerCode
    const maxCodeResult: any = await Customer.findOne({
      attributes: [[sequelize.fn("MAX", sequelize.cast(sequelize.col("customerCode"), "UNSIGNED")), "maxCode"]],
      where: {
        clientId: customer.clientId,
      },
      raw: true,
    });

    let nextCode = 1;
    if (maxCodeResult && maxCodeResult.maxCode) {
      nextCode = parseInt(maxCodeResult.maxCode) + 1;
    }

    customer.customerCode = String(nextCode);
  }
});

// Scope configuration for Customer model
(Customer as any).scopeConfig = {
  client: true,
  location: false,
};

export default Customer;
