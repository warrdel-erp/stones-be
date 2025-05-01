import { DataTypes, Transaction } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user";
import PurchaseOrder from "./purchaseOrder";
import Client from "./client";
import Location from "./location";

const SIPL = sequelize.define(
  "SIPL",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientInvoiceNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    shipDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clientInvoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    poSiplNumber: {
      type: DataTypes.INTEGER,
      allowNull: false, // Auto-Incremented and not null is handled in hook
    },
    combinedSiplNumber: {
      type: DataTypes.STRING,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    supplierInvoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supplierInvoiceDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    supplierNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    updatedBy: {
      allowNull: false,
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    inventoryReceived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
    purchaseLocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    shipmentLocationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
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
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    tableName: "sipl",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientInvoiceNumber"],
      },
      {
        unique: true,
        fields: ["purchaseOrderId", "poSiplNumber"],
      },
    ],
  }
);

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
SIPL.beforeCreate(async (sipl: any) => {
  if (!sipl.clientId && !sipl.purchaseOrderId) {
    throw new Error("Client ID and purchaseOrderId is required to generate clientInvoiceNumber and poSiplNumber.");
  }

  const lastSIPLAccordingToClient: any = await SIPL.findOne({
    where: { clientId: sipl.clientId },
    order: [["clientInvoiceNumber", "DESC"]],
  });

  sipl.clientInvoiceNumber = lastSIPLAccordingToClient ? lastSIPLAccordingToClient.clientInvoiceNumber + 1 : 1;

});

export default SIPL;

