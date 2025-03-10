import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Location from "./location";
import User from "./user";
import Vendor from "./vendor";
import Client from "./client";
import { PO_STATUS } from "../constants/tableTypes";

const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    poDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    clientPoNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PO_STATUS)),
      defaultValue: PO_STATUS.OPEN,
    },
    purchaseLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    shipmentLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    supplierId: {
      type: DataTypes.INTEGER,
      references: {
        model: Vendor,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    supplierSo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    etaDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    container: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveryType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipmentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "purchase_order",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientPoNumber"],
      },
    ],
  }
);

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
PurchaseOrder.beforeCreate(async (purchaseOrder: any) => {
  if (!purchaseOrder.clientId) {
    throw new Error("Client ID is required to generate clientPONumber.");
  }

  let lastPOAccordingToClient: any = await PurchaseOrder.findOne({
    where: { clientId: purchaseOrder.clientId },
    order: [["clientPoNumber", "DESC"]],
  });

  lastPOAccordingToClient = lastPOAccordingToClient?.get({ plain: true });

  purchaseOrder.clientPoNumber = !!lastPOAccordingToClient ? lastPOAccordingToClient.clientPoNumber + 1 : 1;
});

export default PurchaseOrder;
