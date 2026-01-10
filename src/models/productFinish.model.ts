import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import Client from "./client.model";

const ProductFinish = sequelize.define(
    "ProductFinish",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                name: "unique_group_name",
                msg: "Group name must be unique",
            },
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
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: User,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "product_finishes",
        timestamps: true,
    }
);

// Scope configuration for ProductFinish model
(ProductFinish as any).scopeConfig = {
    client: true,
    location: false,
};

export default ProductFinish;
