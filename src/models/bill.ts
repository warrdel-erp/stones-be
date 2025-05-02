import { DataTypes } from "sequelize";
import Vendor from "./vendor";
import { sequelize } from "../config/database";
import User from "./user";
import { BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import SIPL from "./sipl";

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
    billCode: {
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
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: false,
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
        model: Vendor,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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

// 🔹 Hook: Auto-Increment `clientBillNumber` based on `clientId`
Bill.beforeCreate(async (bill: any) => {
  if (!bill.clientId) {
    throw new Error("Client ID is required to generate clientBillNumber.");
  }

  // Generate unique key for client.
  let lastBillAccordingToClientBillNumber: any = await Bill.findOne({
    where: { clientId: bill.clientId },
    order: [["clientBillNumber", "DESC"]],
  });

  lastBillAccordingToClientBillNumber = lastBillAccordingToClientBillNumber?.get({ plain: true });

  bill.clientBillNumber = !!lastBillAccordingToClientBillNumber
    ? lastBillAccordingToClientBillNumber.clientBillNumber + 1
    : 1;

  // Auto-increment siplBillNumber only if referenceType is 'sipl'
  if (bill.referenceType === "sipl") {
    if (!bill.referenceId) {
      throw new Error("referenceId (SIPL ID) is required for siplBillNumber.");
    }

    let lastSiplBill: any = await Bill.findOne({
      where: {
        referenceType: "sipl",
        referenceId: bill.referenceId,
      },
      order: [["siplBillNumber", "DESC"]],
    });

    const sipl: any = await SIPL.findByPk(bill.referenceId)

    lastSiplBill = lastSiplBill?.get({ plain: true });

    bill.siplBillNumber = !!lastSiplBill
      ? lastSiplBill.siplBillNumber + 1
      : 1;

    bill.billCode = "FB " + sipl.combinedSiplNumber.split(" ")[1] + "-" + bill.siplBillNumber
  }

});

export default Bill;

// according to FB.
// // under PO or not.

// according to VB.
// // under PO or not.