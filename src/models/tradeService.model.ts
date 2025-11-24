import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Service from "./service.model";
import Client from "./client.model";
import Decimal from "decimal.js";

export const TRADE_SERVICE_REFERENCE_TYPES = {
    LOADING_ORDER: "loadingOrder",
    SIPL: "sipl",
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
        referenceType: {
            type: DataTypes.ENUM(...Object.values(TRADE_SERVICE_REFERENCE_TYPES)),
            allowNull: false,
        },
        total: {
            type: DataTypes.VIRTUAL,
            get() {
                const quantity = new Decimal(Number(this.get("quantity")) || 0);
                const price = new Decimal(Number(this.get("price")) || 0);
                const result = quantity.mul(price);
                return Number(result.toDecimalPlaces(2));
            },
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
    },
    {
        tableName: "trade_services",
        timestamps: true,
    }
);

export default TradeService;
export type TradeServiceReferenceType = keyof typeof TRADE_SERVICE_REFERENCE_TYPES; 