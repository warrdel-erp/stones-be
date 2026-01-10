import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

const ServiceCategory = sequelize.define(
    "ServiceCategory",
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
        type: {
            type: DataTypes.ENUM("purchase", "sale")
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
        tableName: "service_categories",
        timestamps: true,
    }
);

// Scope configuration for ServiceCategory model
(ServiceCategory as any).scopeConfig = {
    client: true,
    location: false,
};

export default ServiceCategory; 