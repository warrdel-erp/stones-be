import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import LoadingOrder from "./loadingOrder.model";
import Delivery from "./Delivery.model";
import Client from "./client.model";
import Location from "./location.model";

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
        order: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        loadingOrderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: LoadingOrder,
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
    },
    {
        tableName: "invoice_deliveries",
        timestamps: true,
    }
);

// Scope configuration for InvoiceDelivery model
(InvoiceDelivery as any).scopeConfig = {
    client: true,
    location: false,
};

export default InvoiceDelivery; 