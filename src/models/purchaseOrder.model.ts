import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Location from "./location.model";
import User from "./user.model";
import Vendor from "./vendor.model";
import Client from "./client.model";
import * as models from "./index";
import { PO_STATUS } from "../constants/tableTypes";
import { PAYMENT_TERMS } from "../constants";
import { scoped } from "../utils/scoped";

const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    poDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clientPoNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
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
    status: {
      type: DataTypes.ENUM(...Object.values(PO_STATUS)),
      defaultValue: PO_STATUS.OPEN,
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: models.Location,
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
    shipDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    etaDate: {
      type: DataTypes.DATE,
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
    container: {
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
    tableName: "purchase_orders",
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

  let lastPOAccordingToClient: any = await scoped(PurchaseOrder).findOne({
    where: { clientId: purchaseOrder.clientId },
    order: [["clientPoNumber", "DESC"]],
  });

  lastPOAccordingToClient = lastPOAccordingToClient?.get({ plain: true });

  purchaseOrder.clientPoNumber = lastPOAccordingToClient ? lastPOAccordingToClient.clientPoNumber + 1 : 1;
});

// Scope configuration for PurchaseOrder model
(PurchaseOrder as any).scopeConfig = {
  client: true,
  location: true,
};

export default PurchaseOrder;
