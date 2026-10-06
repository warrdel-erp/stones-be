import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

const Company = sequelize.define(
    "Company",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        companyName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        companyAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        zipCode: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        contactPersonName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        contactMobile: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        displayName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        taxId: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        addressLine2: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: Client,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "companies",
        timestamps: true,
    }
);

export default Company; 