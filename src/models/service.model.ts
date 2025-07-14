import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import LedgerAccount from "./ledgerAccount.model";
import ServiceCategory from "./serviceCategory.model";

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
        uom: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
    },
    {
        tableName: "services",
        timestamps: true,
    }
);

export default Service; 