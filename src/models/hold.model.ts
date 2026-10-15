import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";
import Customer from "./customer.model";
import Client from "./client.model";
import Location from "./location.model";
import { HOLD_STAGES } from "../constants/tableTypes";
import { v4 as uuidv4 } from "uuid";
import { getNextSequenceNumber } from "../services/sequence.service";
import { SEQUENCE_MODEL } from "../constants/sequenceTypes";
import { AppError } from "../helper/appError";

const Hold = sequelize.define(
    "Hold",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fabricatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Customer,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Customer,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Account,
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
                model: Location,
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        opportunityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        clientHoldNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        code: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        stage: {
            type: DataTypes.ENUM(...Object.values(HOLD_STAGES)),
            defaultValue: HOLD_STAGES.INITIATED,
            allowNull: false,
        },
        supersededByQuotationId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "holds",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["clientId", "clientHoldNumber"],
            },
            {
                unique: true,
                fields: ["clientId", "code"],
            },
        ],
    }
);

Hold.beforeUpdate(async (hold: any) => {
    if (hold.changed("clientHoldNumber") || hold.changed("code")) {
        throw new AppError("Hold number and code are immutable and cannot be updated.", 400);
    }
});

Hold.beforeCreate(async (hold: any, options: any) => {
    if (!hold.clientId) {
        throw new Error("Client ID is required to generate clientHoldNumber.");
    }

    if (!hold.clientHoldNumber) {
        hold.clientHoldNumber = await getNextSequenceNumber({
            clientId: hold.clientId,
            modelName: SEQUENCE_MODEL.HOLD,
            transaction: options?.transaction,
        });
    }

    if (!hold.code) {
        hold.code = `HLD-${hold.clientHoldNumber}`;
    }
    
    // Generate unique barcode for Hold
    hold.barcode = "hold/" + uuidv4();
});

// Scope configuration for Hold model
(Hold as any).scopeConfig = {
    client: true,
    location: true,
};

export default Hold;
