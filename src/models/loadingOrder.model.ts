import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";
import SalesOrder from "./salesOrder.model";
import PackagingList from "./packagingList.model";
import Account from "./Account.model";
import * as models from "./index";
import { AppError } from "../helper/appError";
import { getNextSequenceNumber } from "../services/sequence.service";
import { SEQUENCE_MODEL } from "../constants/sequenceTypes";
import { allocateDocumentSequenceAndCode } from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "./documentNumberingConfig.model";

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
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Account,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    packagingListId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
        fields: ["clientId", "code"],
      },
      {
        unique: true,
        fields: ["salesOrderId", "soLoadingOrderNumber"],
      },
    ],
  }
);

// 🔹 Hook: Prevent updating clientLoNumber or code (immutable)
LoadingOrder.beforeUpdate(async (loadingOrder: any) => {
  if (loadingOrder.changed("clientLoNumber") || loadingOrder.changed("code")) {
    throw new AppError("Loading Order number and code are immutable and cannot be updated.", 400);
  }
});

LoadingOrder.beforeCreate(async (loadingOrder: any, options: any) => {
  if (!loadingOrder.clientId) {
    throw new AppError("Client ID is required to generate clientLoNumber.", 400);
  }

  if (!loadingOrder.clientLoNumber || !loadingOrder.code) {
    const { sequenceNumber, code } = await allocateDocumentSequenceAndCode({
      clientId: loadingOrder.clientId,
      documentType: DOCUMENT_NUMBERING_TYPE.LOADING_ORDER,
      transaction: options?.transaction,
    });
    if (!loadingOrder.clientLoNumber) loadingOrder.clientLoNumber = sequenceNumber;
    if (!loadingOrder.code) loadingOrder.code = code;
  }

  if (!loadingOrder.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soLoadingOrderNumber.", 400);
  }

  const salesOrder: any = await SalesOrder.findByPk(loadingOrder.salesOrderId, {
    transaction: options?.transaction,
  });

  if (!salesOrder) {
    throw new AppError("Sales Order not found", 400);
  }

  if (!loadingOrder.soLoadingOrderNumber) {
    loadingOrder.soLoadingOrderNumber = await getNextSequenceNumber({
      clientId: loadingOrder.clientId,
      modelName: SEQUENCE_MODEL.SO_LOADING_ORDER,
      scopeKey: String(loadingOrder.salesOrderId),
      transaction: options?.transaction,
    });
  }
});

(LoadingOrder as any).scopeConfig = {
  client: true,
  location: true,
};

export default LoadingOrder;
