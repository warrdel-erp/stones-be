import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Service from "./service.model";
import Client from "./client.model";

export const TRADE_SERVICE_REFERENCE_TYPES = {
    LOADING_ORDER: "loadingOrder",
    PURCHASE_ORDER: "purchaseOrder",
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
            type: DataTypes.ENUM(
                TRADE_SERVICE_REFERENCE_TYPES.LOADING_ORDER,
                TRADE_SERVICE_REFERENCE_TYPES.PURCHASE_ORDER
            ),
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
    },
    {
        tableName: "trade_services",
        timestamps: true,
    }
);

export default TradeService;
export type TradeServiceReferenceType = keyof typeof TRADE_SERVICE_REFERENCE_TYPES; 