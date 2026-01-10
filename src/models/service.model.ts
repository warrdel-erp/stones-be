import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { UNITS_OF_MEASUREMENT } from "../constants";
import LedgerAccount from "./ledgerAccount.model";
import ServiceCategory from "./serviceCategory.model";
import Client from "./client.model";

const Service = sequelize.define(
    "Service",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        uomId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        uom: {
            type: DataTypes.VIRTUAL,
            get() {
                return UNITS_OF_MEASUREMENT.find((e) => e.id === this.get("uomId"));
            },
        },
        basePrice: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        ledgerAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: LedgerAccount,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        serviceCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: ServiceCategory,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
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
        tableName: "services",
        timestamps: true,
    }
);

// Scope configuration for Service model
(Service as any).scopeConfig = {
    client: true,
    location: false,
};

export default Service; 