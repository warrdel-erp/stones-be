import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";
import Customer from "./customer.model";
import Client from "./client.model";

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
    },
    {
        tableName: "selection_sheets",
        timestamps: true,
    }
);

export default SelectionSheet;

