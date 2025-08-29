import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import { SCOP } from "../constants";
import { CUSTOMER_STATUS } from "../constants/tableTypes";
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
      type: DataTypes.INTEGER,
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
    scope: {
      type: DataTypes.ENUM(...SCOP.map((scope) => String(scope.id))),
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
  },
  {
    tableName: "customers",
    timestamps: true,
    paranoid: true, // Enables soft delete
  }
);

export default Customer;
