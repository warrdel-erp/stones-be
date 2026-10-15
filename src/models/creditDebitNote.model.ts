import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { CREDIT_NOTE_REFERENCE_TYPES, CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES, CREDIT_DEBIT_NOTE_TYPES } from "../constants/tableTypes";
import Client from "./client.model";
import { getNextSequenceNumber } from "../services/sequence.service";
import { SEQUENCE_MODEL } from "../constants/sequenceTypes";
import { AppError } from "../helper/appError";

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
        clientCreditNoteNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        creditNoteNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        code: {
            type: DataTypes.STRING(100),
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
        indexes: [
            {
                unique: true,
                fields: ["clientId", "code"],
            },
        ],
    }
);

// 🔹 Hook: Prevent updating creditNoteNumber or code (immutable)
CreditDebitNote.beforeUpdate(async (note: any) => {
    if (note.changed("creditNoteNumber") || note.changed("clientCreditNoteNumber") || note.changed("code")) {
        throw new AppError("Credit Note number and code are immutable and cannot be updated.", 400);
    }
});

// 🔹 Hook: Auto-Increment `creditNoteNumber` using locked sequence
CreditDebitNote.beforeCreate(async (note: any, options: any) => {
    if (!note.clientId) {
        throw new Error("Client ID is required to generate creditNoteNumber.");
    }

    if (!note.creditNoteNumber) {
        const nextNum = await getNextSequenceNumber({
            clientId: note.clientId,
            modelName: SEQUENCE_MODEL.CREDIT_DEBIT_NOTE,
            transaction: options?.transaction,
        });

        note.creditNoteNumber = String(nextNum);
        if (!note.clientCreditNoteNumber) {
            note.clientCreditNoteNumber = nextNum;
        }
    }

    if (!note.code) {
        note.code = `CN-${note.clientCreditNoteNumber || note.creditNoteNumber}`;
    }
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
