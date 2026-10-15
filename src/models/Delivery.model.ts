import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Truck from "./truck.model";
import { DELIVERY_STATUS } from "../constants/tableTypes";
import Client from "./client.model";
import { AppError } from "../helper/appError";
import { allocateDocumentSequenceAndCode } from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "./documentNumberingConfig.model";

const Delivery = sequelize.define(
    "Delivery",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        clientDeliveryNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        code: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(DELIVERY_STATUS)),
        },
        truckId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Truck,
                key: "id",
            },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Client,
                key: "id",
            },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        fromLat: { type: DataTypes.FLOAT, allowNull: true },
        fromLng: { type: DataTypes.FLOAT, allowNull: true },
        fromAddress: { type: DataTypes.TEXT, allowNull: true },
    },
    {
        tableName: "deliveries",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["clientId", "clientDeliveryNumber"],
            },
            {
                unique: true,
                fields: ["clientId", "code"],
            },
        ],
    }
);

// 🔹 Hook: Prevent updating clientDeliveryNumber or code (immutable)
Delivery.beforeUpdate(async (delivery: any) => {
    if (delivery.changed("clientDeliveryNumber") || delivery.changed("code")) {
        throw new AppError("Delivery number and code are immutable and cannot be updated.", 400);
    }
});

// 🔹 Hook: Auto-Increment clientDeliveryNumber and format code using locked sequence
Delivery.beforeCreate(async (delivery: any, options: any) => {
    if (!delivery.clientId) {
        throw new AppError("Client ID is required to generate delivery number.", 400);
    }

    if (!delivery.clientDeliveryNumber || !delivery.code) {
        const { sequenceNumber, code } = await allocateDocumentSequenceAndCode({
            clientId: delivery.clientId,
            documentType: DOCUMENT_NUMBERING_TYPE.DELIVERY_NOTE,
            transaction: options?.transaction,
        });
        if (!delivery.clientDeliveryNumber) delivery.clientDeliveryNumber = sequenceNumber;
        if (!delivery.code) delivery.code = code;
    }
});

// Scope configuration for Delivery model
(Delivery as any).scopeConfig = {
    client: true,
    location: false,
};

export default Delivery;