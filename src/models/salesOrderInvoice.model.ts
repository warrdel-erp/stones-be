import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Customer from "./customer.model";
import LoadingOrder from "./loadingOrder.model";
import Client from "./client";

export type SoInvoice = {
    customerId: number;
    loadingOrderId: number;
    clientId: number;
    amount: number;
}

const SalesOrderInvoice = sequelize.define(
    "SalesOrderInvoice",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        clientSoInvoiceNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        customerId: {
            type: DataTypes.INTEGER,
            references: {
                model: Customer,
                key: "id",
            },
            onUpdate: "CASCADE",
            allowNull: false,
        },
        loadingOrderId: {
            type: DataTypes.INTEGER,
            references: {
                model: LoadingOrder,
                key: "id",
            },
            onUpdate: "CASCADE",
            allowNull: false,
        },
        clientId: {
            type: DataTypes.INTEGER,
            references: {
                model: Client,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
    },
    {
        tableName: "sales_order_invoices",
        timestamps: true, // Enables createdAt and updatedAt fields
    }
);

// 🔹 Hook: Auto-Increment `clientInvoiceNumber` based on `clientId`
SalesOrderInvoice.beforeCreate(async (soInvoice: any) => {
    if (!soInvoice.clientId && !soInvoice.purchaseOrderId) {
        throw new Error("Client ID is required to generate clientSoInvoiceNumber.");
    }

    const lastSoInvoiceAccordingToClient: any = await SalesOrderInvoice.findOne({
        where: { clientId: soInvoice.clientId },
        order: [["clientSoInvoiceNumber", "DESC"]],
    });

    soInvoice.clientSoInvoiceNumber = lastSoInvoiceAccordingToClient ? lastSoInvoiceAccordingToClient.clientSoInvoiceNumber + 1 : 1;
});


export default SalesOrderInvoice;
