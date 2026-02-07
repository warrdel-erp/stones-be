import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Notes from "./note.model";
import { VENDOR_TYPES } from "../constants/tableTypes";
import User from "./user.model";
import { SCOP } from "../constants";
import Location from "./location.model";
import Client from "./client.model";

const Vendor = sequelize.define(
  "Vendor",
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
    printName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentLocationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Location,
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(VENDOR_TYPES)),
      allowNull: false,
    },
    vendorScope: {
      type: DataTypes.ENUM(...SCOP.map((scope) => String(scope.id))),
      allowNull: true,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendorSince: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    primaryPhoneNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secondaryPhoneNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    landlineNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    accountingEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    remitAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remitSuite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remitCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    remitState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remitZip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remitCountry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingSuite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingZip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.INTEGER,
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
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "USD",
    },
    defaultPaymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    internalNotesId: {
      type: DataTypes.INTEGER,
      references: {
        model: Notes,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
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
    tableName: "vendors",
    timestamps: true,
    paranoid: true, // Enables soft delete
    indexes: [
      { unique: true, fields: ["primaryPhoneNo", "clientId"], name: "unique_vendor_primary_phone_per_client" },
    ],
  }
);

// Scope configuration for Vendor model
(Vendor as any).scopeConfig = {
  client: true,
  location: false,
};

export default Vendor;
