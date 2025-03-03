import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user";

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
    type: {
      type: DataTypes.STRING,
      allowNull: true,
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
    salesTax: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
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
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
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
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "customers",
    timestamps: true,
    paranoid: true, // Enables soft delete
  }
);

export default Customer;
