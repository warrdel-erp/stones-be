import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import LoadingOrder from "./loadingOrder.model";
import Client from "./client.model";
import SalesOrder from "./salesOrder.model";
import * as models from "./index";
import { AppError } from "../helper/appError";
import { scoped } from "../utils/scoped";

const PackagingList = sequelize.define(
  "PackagingList",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING
    },
    soPackagingListNumber: {
      type: DataTypes.INTEGER,
    },
    clientPlNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      allowNull: false,
    },
    loadingOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LoadingOrder,
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
    tableName: "packaging_lists",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["loadingOrderId"], // Ensures database enforces uniqueness
      },
      {
        unique: true,
        fields: ["clientId", "clientPlNumber"],
      },
      {
        unique: true,
        fields: ["salesOrderId", "soPackagingListNumber"],
      },
    ],
  }
);

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
PackagingList.beforeCreate(async (packagingList: any) => {
  if (!packagingList.clientId) {
    throw new Error("Client ID is required to generate clientPlNumber.");
  }

  let lastPLAccordingToClient: any = await scoped(PackagingList).findOne({
    where: { clientId: packagingList.clientId },
    order: [["clientPlNumber", "DESC"]],
  });

  lastPLAccordingToClient = lastPLAccordingToClient?.get({ plain: true });

  packagingList.clientPlNumber = !!lastPLAccordingToClient ? lastPLAccordingToClient.clientPlNumber + 1 : 1;

  //  Generate soPackagingListNumber

  if (!packagingList.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soPackagingListNumber.", 400);
  }

  const lastPLAccordingToSo: any = await scoped(PackagingList).findOne({
    where: { salesOrderId: packagingList.salesOrderId },
    order: [["soPackagingListNumber", "DESC"]],
  });

  const salesOrder: any = await SalesOrder.findByPk(packagingList.salesOrderId)

  packagingList.soPackagingListNumber = lastPLAccordingToSo ? lastPLAccordingToSo.soPackagingListNumber + 1 : 1;
  packagingList.code = `PL ${salesOrder.clientSoNumber}-${packagingList.soPackagingListNumber}`;

});

// Scope configuration for PackagingList model
(PackagingList as any).scopeConfig = {
  client: true,
  location: true,
};

export default PackagingList;
