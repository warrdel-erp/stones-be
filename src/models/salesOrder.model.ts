import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user";
import * as models from "../models";
import CustomerAddress from "./customerAddress.model";
import { DELIVERY_TYPES } from "../constants/tableTypes";

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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending", // Example: pending, confirmed, shipped, completed, canceled
    },
    deliveryType: {
      type: DataTypes.ENUM(...Object.values(DELIVERY_TYPES)),
      allowNull: false,
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taxId: {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
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

export default SalesOrder;
