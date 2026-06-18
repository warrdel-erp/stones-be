import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";
import Customer from "./customer.model";
import Client from "./client.model";
import Location from "./location.model";
import { HOLD_STAGES } from "../constants/tableTypes";

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
            allowNull: true,
            references: {
                model: Customer,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        clientHoldNumber: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        stage: {
            type: DataTypes.ENUM(...Object.values(HOLD_STAGES)),
            defaultValue: HOLD_STAGES.INITIATED,
            allowNull: false,
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
        ],
    }
);

Hold.beforeCreate(async (hold: any) => {
    if (!hold.clientId) {
        throw new Error("Client ID is required to generate clientHoldNumber.");
    }

    let lastHoldAccordingToClient: any = await Hold.findOne({
        where: { clientId: hold.clientId },
        order: [["clientHoldNumber", "DESC"]],
    });

    lastHoldAccordingToClient = lastHoldAccordingToClient?.get({ plain: true });

    hold.clientHoldNumber = !!lastHoldAccordingToClient ? lastHoldAccordingToClient.clientHoldNumber + 1 : 1;
});

// Scope configuration for Hold model
(Hold as any).scopeConfig = {
    client: true,
    location: true,
};

export default Hold;
