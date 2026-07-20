import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { CREDIT_NOTE_REFERENCE_TYPES, CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES, CREDIT_DEBIT_NOTE_TYPES } from "../constants/tableTypes";
import Client from "./client.model";

const CreditDebitNote = sequelize.define(
    "CreditDebitNote",
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
        type: {
            type: DataTypes.ENUM(...Object.values(CREDIT_DEBIT_NOTE_TYPES)),
        },
        entryFor: {
            type: DataTypes.ENUM(...Object.values(CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES)),
            allowNull: false,
        },
        entryIdFor: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        referenceType: {
            type: DataTypes.ENUM(...Object.values(CREDIT_NOTE_REFERENCE_TYPES)),
        },
        referenceId: {
            type: DataTypes.INTEGER,
        },
        creditNoteNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        creditNoteDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        reasonType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        claimReferenceNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        inventoryImpactType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        inventoryAdjustmentValue: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active',
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Client,
                key: "id",
            },
        },
    },
    {
        tableName: "credit_debit_notes",
        timestamps: true,
    }
);

// 🔹 Hook: Auto-Increment `creditNoteNumber` based on `clientId`
CreditDebitNote.beforeCreate(async (note: any) => {
    if (!note.clientId) {
        throw new Error("Client ID is required to generate creditNoteNumber.");
    }

    // Retrieve all notes for this client to determine next sequence number
    const notes: any[] = await CreditDebitNote.findAll({
        where: { clientId: note.clientId },
        attributes: ["creditNoteNumber"],
        raw: true
    });

    let maxNum = 0;
    for (const n of notes) {
        if (n.creditNoteNumber) {
            const num = parseInt(n.creditNoteNumber, 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    }

    note.creditNoteNumber = String(maxNum + 1);
});

// // Define associations
// CreditDebitNote.belongsTo(Client, {
//     foreignKey: "clientId",
//     as: "client",
// });

// Scope configuration for CreditDebitNote model
(CreditDebitNote as any).scopeConfig = {
    client: true,
    location: false,
};

export default CreditDebitNote;
