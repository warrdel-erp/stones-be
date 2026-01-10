import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model"; // adjust the path if needed
import Client from "./client.model";

const ProductGroup = sequelize.define(
    "ProductGroup",
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
        tableName: "product_groups",
        timestamps: true,
    }
);

// Scope configuration for ProductGroup model
(ProductGroup as any).scopeConfig = {
    client: true,
    location: false,
};

export default ProductGroup;
