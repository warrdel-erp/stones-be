import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";
import Customer from "./customer.model";
import Client from "./client.model";
import Location from "./location.model";

const SelectionSheet = sequelize.define(
    "SelectionSheet",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
    },
    {
        tableName: "selection_sheets",
        timestamps: true,
    }
);

// Scope configuration for SelectionSheet model
(SelectionSheet as any).scopeConfig = {
    client: true,
    location: true,
};

export default SelectionSheet;

