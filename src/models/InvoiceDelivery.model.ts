import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrderInvoice from "./salesOrderInvoice.model";
import Delivery from "./Delivery.model";

const InvoiceDelivery = sequelize.define(
    "InvoiceDelivery",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fromLat: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        fromLng: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        fromAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        toLat: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        toLng: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        toAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        soInvoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: SalesOrderInvoice,
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        deliveryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Delivery,
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
    },
    {
        tableName: "invoice_deliveries",
        timestamps: true,
    }
);

export default InvoiceDelivery; 