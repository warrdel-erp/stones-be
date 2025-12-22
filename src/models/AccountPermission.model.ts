import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";

// Define AccountPermission Model
const AccountPermission = sequelize.define(
    "AccountPermission",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        permission: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Account,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "account_permissions",
        timestamps: true,
    }
);

export default AccountPermission;
