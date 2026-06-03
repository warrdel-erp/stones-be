import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Service from "./service.model";
import Client from "./client.model";
import Decimal from "decimal.js";
import * as decimal from '../helper/decimal'

export const TRADE_SERVICE_REFERENCE_TYPES = {
    PACKAGING_LIST: "packagingList",
    SIPL: "sipl",
    RETURN: "return",
} as const;

const TradeService = sequelize.define(
    "TradeService",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        total: {
            type: DataTypes.VIRTUAL,
            get() {
                const quantity = (Number(this.get("quantity")) || 0);
                const price = (Number(this.get("price")) || 0);
                const result = decimal.decimalMultiply(quantity, price);
                return result;
            },
        },
        referenceType: {
            type: DataTypes.ENUM(...Object.values(TRADE_SERVICE_REFERENCE_TYPES)),
            allowNull: false,
        },
        referenceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Service,
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
            onDelete: "CASCADE",
        },
        applyToCustomer: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    },
    {
        tableName: "trade_services",
        timestamps: true,
    }
);

// Scope configuration for TradeService model
(TradeService as any).scopeConfig = {
    client: true,
    location: false,
};

export default TradeService;
export type TradeServiceReferenceType = keyof typeof TRADE_SERVICE_REFERENCE_TYPES; 