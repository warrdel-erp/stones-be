import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";
import LedgerAccount from "./ledgerAccount.model";
import Client from "./client.model";
import * as models from "./index";
import { AppError } from "../helper/appError";
import { getNextSequenceNumber } from "../services/sequence.service";
import { SEQUENCE_MODEL } from "../constants/sequenceTypes";

const AdvancedDeposit = sequelize.define(
    "AdvancedDeposit",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0,
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
            onDelete: "RESTRICT",
        },
        soAdvancedDepositNumber: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: LedgerAccount,
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
                model: models.Location,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "advanced_deposits",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["soAdvancedDepositNumber", "salesOrderId"],
            },
        ]
    }
);

// Scope configuration for AdvancedDeposit model
(AdvancedDeposit as any).scopeConfig = {
    client: true,
    location: true,
};

export default AdvancedDeposit;


AdvancedDeposit.beforeCreate(async (advancedDeposit: any, options: any) => {
    if (!advancedDeposit.salesOrderId) {
        throw new AppError('salesOrderId is required', 400);
    }

    const salesOrder: any = await SalesOrder.findByPk(advancedDeposit.salesOrderId, {
        attributes: ['id', 'clientId', 'clientSoNumber'],
        raw: true,
        transaction: options?.transaction,
    });

    if (!salesOrder) {
        throw new AppError('Sales Order not found', 400);
    }

    if (!advancedDeposit.soAdvancedDepositNumber) {
        advancedDeposit.soAdvancedDepositNumber = await getNextSequenceNumber({
            clientId: salesOrder.clientId,
            modelName: SEQUENCE_MODEL.ADVANCED_DEPOSIT,
            scopeKey: String(advancedDeposit.salesOrderId),
            transaction: options?.transaction,
        });
    }

    advancedDeposit.code = "AD " + salesOrder.clientSoNumber + '-' + advancedDeposit.soAdvancedDepositNumber;
});