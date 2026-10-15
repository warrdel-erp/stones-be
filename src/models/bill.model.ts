import { DataTypes } from "sequelize";
import Vendor from "./vendor.model";
import { sequelize } from "../config/database";
import User from "./user.model";
import { BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import SIPL from "./sipl.model";
import Client from "./client.model";
import Location from "./location.model";
import { PAYMENT_TERMS } from "../constants";
import { getNextSequenceNumber } from "../services/sequence.service";
import { SEQUENCE_MODEL } from "../constants/sequenceTypes";

const Bill = sequelize.define(
  "bills",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    invoiceCode: {
      type: DataTypes.STRING
    },
    siplBillNumber: {
      type: DataTypes.INTEGER,
    },
    invoice: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    billDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    clientBillNumber: {
      type: DataTypes.INTEGER,
      allowNull: true, // Auto-Incremented and not null is handled in hook
    },
    type: {
      type: DataTypes.ENUM("freight"),
      allowNull: false,
    },
    paymentTermId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentTerm: {
      type: DataTypes.VIRTUAL,
      get() {
        return PAYMENT_TERMS.find((e) => e.id === this.get("paymentTermId"));
      },
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(BILL_REFERENCE_TYPES)), // Could be "sipl" or other types
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Vendor,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
  },
  {
    tableName: "bills",
    timestamps: true,
    indexes: [
      {
        fields: ["clientId", "clientBillNumber"],
      },
    ],
  }
);

// 🔹 Hook: Auto-Increment `clientBillNumber` and `siplBillNumber` using locked sequence
Bill.beforeCreate(async (bill: any, options: any) => {
  if (!bill.clientId) {
    throw new Error("Client ID is required to generate clientBillNumber.");
  }

  if (!bill.clientBillNumber) {
    bill.clientBillNumber = await getNextSequenceNumber({
      clientId: bill.clientId,
      modelName: SEQUENCE_MODEL.BILL,
      transaction: options?.transaction,
    });
  }

  // Auto-increment siplBillNumber only if referenceType is 'sipl'
  if (bill.referenceType === BILL_REFERENCE_TYPES.SIPL) {
    if (!bill.referenceId) {
      throw new Error("referenceId (SIPL ID) is required for siplBillNumber.");
    }

    const sipl: any = await SIPL.findByPk(bill.referenceId, {
      transaction: options?.transaction,
    });

    if (!sipl) {
      throw new Error(`SIPL not found with id: ${bill.referenceId}`);
    }

    if (!bill.siplBillNumber) {
      bill.siplBillNumber = await getNextSequenceNumber({
        clientId: bill.clientId,
        modelName: SEQUENCE_MODEL.SIPL_BILL,
        scopeKey: String(bill.referenceId),
        transaction: options?.transaction,
      });
    }

    bill.invoiceCode = "FB " + sipl.invoiceCode.split(" ")[1] + "-" + bill.siplBillNumber;
  }
});

// Scope configuration for Bill model
(Bill as any).scopeConfig = {
  client: true,
  location: true,
};

export default Bill;

// according to FB.
// // under PO or not.

// according to VB.
// // under PO or not.