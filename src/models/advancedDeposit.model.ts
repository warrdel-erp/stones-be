import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";
import LedgerAccount from "./ledgerAccount.model";
import Client from "./client.model";
import * as models from "./index";
import { AppError } from "../helper/appError";

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


AdvancedDeposit.beforeCreate(async (advancedDeposit: any) => {

    if (!advancedDeposit.salesOrderId) {
        throw new AppError('salesOrderId is required', 400)
    }

    const lastAdvancedDepositNumberAsPerSO: any = await AdvancedDeposit.findOne({
        where: { salesOrderId: advancedDeposit.salesOrderId },
        attributes: ['soAdvancedDepositNumber', 'code'],
        order: [['soAdvancedDepositNumber', 'DESC']]
    })

    advancedDeposit.soAdvancedDepositNumber = lastAdvancedDepositNumberAsPerSO ? lastAdvancedDepositNumberAsPerSO.soAdvancedDepositNumber + 1 : 1

    // Save pre-created code. 
    if (lastAdvancedDepositNumberAsPerSO) {
        const withoutLastCode = lastAdvancedDepositNumberAsPerSO.code.split('-')[0];
        const newCode = withoutLastCode + '-' + advancedDeposit.soAdvancedDepositNumber
        advancedDeposit.code = newCode
    } else {
        const salesOrder: any = await SalesOrder.findByPk(advancedDeposit.salesOrderId, { attributes: ['clientSoNumber'], raw: true });
        advancedDeposit.code = "AD " + salesOrder.clientSoNumber + '-' + 1
    }

})