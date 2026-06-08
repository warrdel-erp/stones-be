import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";
import { AppError } from "../helper/appError";
import Client from "./client.model";
import CustomerAddress from "./customerAddress.model";
import * as models from "./index";
import { DELIVERY_TYPES, PACKAGING_LIST_STAGES } from "../constants/tableTypes";
import { PAYMENT_TERMS } from "../constants";
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
      type: DataTypes.STRING,
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
        fields: ["salesOrderId", "soPackagingListNumber"],
      },
    ],
  }
);

// Hook to prevent updates if invoiced = true or if it is already canceled
PackagingList.beforeUpdate(async (packagingList) => {
  const packagingListExisting = await PackagingList.findByPk(packagingList.dataValues.id);

  if (packagingListExisting?.dataValues.stage === PACKAGING_LIST_STAGES.INVOICED) {
    throw new AppError("Cannot update Packaging List as it is already invoiced.", 400);
  }
  if (packagingListExisting?.dataValues.stage === PACKAGING_LIST_STAGES.CANCELED) {
    throw new AppError("Cannot update a canceled Packaging List.", 400);
  }
});

// Hook: Auto-Increment clientPlNumber based on clientId
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

  if (!packagingList.salesOrderId) {
    throw new AppError("salesOrderId is required to generate soPackagingListNumber.", 400);
  }

  const lastPlAccordingToSo: any = await scoped(PackagingList).findOne({
    where: { salesOrderId: packagingList.salesOrderId },
    order: [["soPackagingListNumber", "DESC"]],
  });

  const salesOrder: any = await SalesOrder.findByPk(packagingList.salesOrderId);

  packagingList.soPackagingListNumber = lastPlAccordingToSo ? lastPlAccordingToSo.soPackagingListNumber + 1 : 1;
  packagingList.code = `PL ${salesOrder.clientSoNumber}-${packagingList.soPackagingListNumber}`;
});

(PackagingList as any).scopeConfig = {
  client: true,
  location: true,
};

export default PackagingList;
