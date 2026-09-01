import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";
import SalesOrder from "./salesOrder.model";
import PackagingList from "./packagingList.model";
import * as models from "./index";
import { AppError } from "../helper/appError";
import { scoped } from "../utils/scoped";

const LoadingOrder = sequelize.define(
  "LoadingOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
    },
    soLoadingOrderNumber: {
      type: DataTypes.INTEGER,
    },
    clientLoNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      allowNull: false,
    },
    packagingListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PackagingList,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: models.Location,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "loading_orders",
    timestamps: true,
    indexes: [
      {
        fields: ["packagingListId"],
      },
      {
        unique: true,
        fields: ["clientId", "clientLoNumber"],
      },
      {
        unique: true,
        fields: ["salesOrderId", "soLoadingOrderNumber"],
      },
    ],
  }
);

LoadingOrder.beforeCreate(async (loadingOrder: any) => {
  if (!loadingOrder.clientId) {
    throw new Error("Client ID is required to generate clientLoNumber.");
  }

  let lastLOAccordingToClient: any = await scoped(LoadingOrder).findOne({
    where: { clientId: loadingOrder.clientId },
    order: [["clientLoNumber", "DESC"]],
  });

  lastLOAccordingToClient = lastLOAccordingToClient?.get({ plain: true });

  loadingOrder.clientLoNumber = lastLOAccordingToClient ? lastLOAccordingToClient.clientLoNumber + 1 : 1;

  if (!loadingOrder.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soLoadingOrderNumber.", 400);
  }

  const lastLOAccordingToSo: any = await scoped(LoadingOrder).findOne({
    where: { salesOrderId: loadingOrder.salesOrderId },
    order: [["soLoadingOrderNumber", "DESC"]],
  });

  const salesOrder: any = await SalesOrder.findByPk(loadingOrder.salesOrderId);

  loadingOrder.soLoadingOrderNumber = lastLOAccordingToSo ? lastLOAccordingToSo.soLoadingOrderNumber + 1 : 1;
  loadingOrder.code = `LO ${salesOrder.clientSoNumber}-${loadingOrder.soLoadingOrderNumber}`;
});

(LoadingOrder as any).scopeConfig = {
  client: true,
  location: true,
};

export default LoadingOrder;
