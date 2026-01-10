import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";
import * as models from "../models";
import CustomerAddress from "./customerAddress.model";
import { DELIVERY_TYPES, SALES_ORDER_STATUS } from "../constants/tableTypes";
import { PAYMENT_TERMS, SALES_TAX } from "../constants";

const SalesOrder = sequelize.define(
  "SalesOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientSoNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    soDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    customerPo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SALES_ORDER_STATUS)),
      allowNull: false,
      defaultValue: SALES_ORDER_STATUS.OPEN,
    },
    deliveryType: {
      type: DataTypes.ENUM(...Object.values(DELIVERY_TYPES)),
      allowNull: false,
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTermId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerPoDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.Customer,
        key: "id",
      },
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CustomerAddress,
        key: "id",
      },
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: models.Client,
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.Location,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    taxId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tax: {
      type: DataTypes.VIRTUAL,
      get() {
        return SALES_TAX.find((e: any) => e.id === this.get("taxId"));
      },
    },
    paymentTerm: {
      type: DataTypes.VIRTUAL,
      get() {
        return PAYMENT_TERMS.find((e) => e.id === this.get("paymentTermId"));
      },
    }
  },
  {
    tableName: "sales_orders",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientSoNumber"],
      },
    ],
  }
);

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
SalesOrder.beforeCreate(async (salesOrder: any) => {
  if (!salesOrder.clientId) {
    throw new Error("Client ID is required to generate clientSONumber.");
  }

  let lastSOAccordingToClient: any = await SalesOrder.findOne({
    where: { clientId: salesOrder.clientId },
    order: [["clientSoNumber", "DESC"]],
  });

  lastSOAccordingToClient = lastSOAccordingToClient?.get({ plain: true });

  salesOrder.clientSoNumber = !!lastSOAccordingToClient ? lastSOAccordingToClient.clientSoNumber + 1 : 1;
});

// Scope configuration for SalesOrder model
(SalesOrder as any).scopeConfig = {
  client: true,
  location: true,
};

export default SalesOrder;
