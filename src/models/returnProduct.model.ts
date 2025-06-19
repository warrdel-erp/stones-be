import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Return from "./return.model";
import SalesOrderProduct from "./salesOrderProduct.model";

const ReturnProduct = sequelize.define(
    "ReturnProduct",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        salesOrderProductId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: SalesOrderProduct,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        returnId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Return,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "return_products",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["returnId", "salesOrderProductId"], // Ensures a product can only be returned once per return
            },
        ],
    }
);

export default ReturnProduct; 