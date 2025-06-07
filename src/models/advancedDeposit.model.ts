import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";

const AdvancedDeposit = sequelize.define(
    "AdvancedDeposit",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        salesOrderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: SalesOrder,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
    },
    {
        tableName: "advanced_deposits",
        timestamps: true,
    }
);


export default AdvancedDeposit; 