import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Vendor from "./vendor.model";
import Client from "./client.model";

const VendorContact = sequelize.define(
  "VendorContact",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Vendor,
        key: "id",
      },
      onDelete: "CASCADE",
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
    tableName: "vendor_contacts",
    timestamps: true,
  }
);

// Scope configuration for VendorContact model
(VendorContact as any).scopeConfig = {
  client: true,
  location: false,
};

export default VendorContact;
