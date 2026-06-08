import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import PurchaseOrder from "./purchaseOrder.model";
import Client from "./client.model";
import Location from "./location.model";
import { scoped } from "../utils/scoped";
import { PAYMENT_TERMS } from "../constants";
import { SIPL_STATUS } from "../constants/tableTypes";

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
    invoiceCode: {
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
      type: DataTypes.ENUM(...Object.values(SIPL_STATUS)),
      allowNull: false,
      defaultValue: SIPL_STATUS.PENDING,
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
    receivedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
    },
    locationId: {
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
    tableName: "sipls",
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

  const lastSIPLAccordingToClient: any = await scoped(SIPL).findOne({
    where: { clientId: sipl.clientId },
    order: [["clientInvoiceNumber", "DESC"]],
  });

  sipl.clientInvoiceNumber = lastSIPLAccordingToClient ? lastSIPLAccordingToClient.clientInvoiceNumber + 1 : 1;

});

// Scope configuration for SIPL model
(SIPL as any).scopeConfig = {
  client: true,
  location: true,
};

export default SIPL;

