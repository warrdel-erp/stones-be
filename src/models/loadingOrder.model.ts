import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";
import { AppError } from "../helper/appError";
import Client from "./client";
import CustomerAddress from "./customerAddress.model";
import { DELIVERY_TYPES, LOADING_ORDER_STAGES } from "../constants/tableTypes";

const LoadingOrder = sequelize.define(
  "LoadingOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientLoNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    loDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    expDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveryType: {
      type: DataTypes.ENUM(...Object.values(DELIVERY_TYPES)),
      allowNull: false,
    },
    stage: {
      type: DataTypes.ENUM(...Object.values(LOADING_ORDER_STAGES)),
      defaultValue: LOADING_ORDER_STAGES.INITIATED,
      allowNull: false,
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: CustomerAddress,
        key: "id",
      },
    },
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    tableName: "loading_orders",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientLoNumber"],
      },
    ],
  }
);

// Hook to prevent updates if invoiced = true
LoadingOrder.beforeUpdate(async (loadingOrder, options) => {
  const loadingOrderExisting = await LoadingOrder.findByPk(loadingOrder.dataValues.id);

  if (loadingOrderExisting?.dataValues.invoiced) {
    throw new AppError("Cannot update Loading Order as it is already invoiced.", 400);
  }
});

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
LoadingOrder.beforeCreate(async (loadingOrder: any) => {
  if (!loadingOrder.clientId) {
    throw new Error("Client ID is required to generate clientLoNumber.");
  }

  let lastLOAccordingToClient: any = await LoadingOrder.findOne({
    where: { clientId: loadingOrder.clientId },
    order: [["clientLoNumber", "DESC"]],
  });

  lastLOAccordingToClient = lastLOAccordingToClient?.get({ plain: true });

  loadingOrder.clientLoNumber = !!lastLOAccordingToClient ? lastLOAccordingToClient.clientLoNumber + 1 : 1;
});

export default LoadingOrder;
