import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import SalesOrderInvoice from "./salesOrderInvoice.model";

const RETURN_STATUS = {
    INITIATED: "initiated",
    COMPLETE: "complete",
    CANCELLED: "canceled"
} as const;

const Return = sequelize.define(
    "Return",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(RETURN_STATUS)),
            allowNull: false,
            defaultValue: RETURN_STATUS.INITIATED,
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: SalesOrderInvoice,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
    },
    {
        tableName: "returns",
        timestamps: true,
    }
);

export { RETURN_STATUS };
export default Return; 