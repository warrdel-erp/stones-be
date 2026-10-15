import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";
import { AppError } from "../helper/appError";
import Client from "./client.model";
import CustomerAddress from "./customerAddress.model";
import * as models from "./index";
import { DELIVERY_TYPES, PACKAGING_LIST_STAGES } from "../constants/tableTypes";
import { PAYMENT_TERMS } from "../constants";
import { getNextSequenceNumber } from "../services/sequence.service";
import { SEQUENCE_MODEL } from "../constants/sequenceTypes";
import { allocateDocumentSequenceAndCode } from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "./documentNumberingConfig.model";

const PackagingList = sequelize.define(
  "PackagingList",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientPlNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    plDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    soPackagingListNumber: {
      type: DataTypes.INTEGER,
    },
    expDeliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paymentTermId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.ENUM(...Object.values(PACKAGING_LIST_STAGES)),
      defaultValue: PACKAGING_LIST_STAGES.INITIATED,
      allowNull: false,
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    paymentTerm: {
      type: DataTypes.VIRTUAL,
      get() {
        return PAYMENT_TERMS.find((e) => e.id === this.get("paymentTermId"));
      },
    },
  },
  {
    tableName: "packaging_lists",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["clientId", "clientPlNumber"],
      },
      {
        unique: true,
        fields: ["clientId", "code"],
      },
      {
        unique: true,
        fields: ["salesOrderId", "soPackagingListNumber"],
      },
    ],
  }
);

// Hook to prevent updates if invoiced = true, canceled, or attempting to update immutable numbers
PackagingList.beforeUpdate(async (packagingList: any) => {
  if (packagingList.changed("clientPlNumber") || packagingList.changed("code")) {
    throw new AppError("Packaging List number and code are immutable and cannot be updated.", 400);
  }

  const packagingListExisting = await PackagingList.findByPk(packagingList.dataValues.id);

  if (packagingListExisting?.dataValues.stage === PACKAGING_LIST_STAGES.INVOICED) {
    throw new AppError("Cannot update Packaging List as it is already invoiced.", 400);
  }
  if (packagingListExisting?.dataValues.stage === PACKAGING_LIST_STAGES.CANCELED) {
    throw new AppError("Cannot update a canceled Packaging List.", 400);
  }
});

// Hook: Auto-Increment clientPlNumber and soPackagingListNumber using locked sequence
PackagingList.beforeCreate(async (packagingList: any, options: any) => {
  if (!packagingList.clientId) {
    throw new Error("Client ID is required to generate clientPlNumber.");
  }

  if (!packagingList.clientPlNumber || !packagingList.code) {
    const { sequenceNumber, code } = await allocateDocumentSequenceAndCode({
      clientId: packagingList.clientId,
      documentType: DOCUMENT_NUMBERING_TYPE.PACKAGING_LIST,
      transaction: options?.transaction,
    });
    if (!packagingList.clientPlNumber) packagingList.clientPlNumber = sequenceNumber;
    if (!packagingList.code) packagingList.code = code;
  }

  if (!packagingList.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soPackagingListNumber.", 400);
  }

  const salesOrder: any = await SalesOrder.findByPk(packagingList.salesOrderId, {
    transaction: options?.transaction,
  });

  if (!salesOrder) {
    throw new AppError("Sales Order not found", 400);
  }

  if (!packagingList.soPackagingListNumber) {
    packagingList.soPackagingListNumber = await getNextSequenceNumber({
      clientId: packagingList.clientId,
      modelName: SEQUENCE_MODEL.SO_PACKAGING_LIST,
      scopeKey: String(packagingList.salesOrderId),
      transaction: options?.transaction,
    });
  }
});

(PackagingList as any).scopeConfig = {
  client: true,
  location: true,
};

export default PackagingList;
