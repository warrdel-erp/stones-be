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

// // Define associations
// CreditDebitNote.belongsTo(Client, {
//     foreignKey: "clientId",
//     as: "client",
// });

export default CreditDebitNote;
