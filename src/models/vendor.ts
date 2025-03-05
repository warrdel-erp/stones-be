import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Notes from "./note";
import { VENDOR_TYPES } from "../constants/tableTypes";
import User from "./user";
import { VENDOR_SCOP } from "../constants";
import Location from "./location";

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
    parentLocation: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      type: DataTypes.ENUM(...VENDOR_SCOP.map((scope) => String(scope.id))),
      allowNull: false,
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
      allowNull: false,
    },
    remitSuite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    remitCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remitState: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remitZip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remitCountry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingSuite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingZip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentTerms: {
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
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    tableName: "vendor",
    timestamps: true,
    paranoid: true, // Enables soft delete
  }
);

export default Vendor;
