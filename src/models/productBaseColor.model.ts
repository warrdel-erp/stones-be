import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model"; // Adjust the path if needed

const ProductBaseColor = sequelize.define(
    "ProductBaseColor",
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
                name: "unique_base_color_name",
                msg: "Base color name must be unique",
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
    },
    {
        tableName: "product_base_colors",
        timestamps: true,
    }
);

export default ProductBaseColor;