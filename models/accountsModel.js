import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import {status} from '../constant.js'; 
import subAccountTypes from "./subAccountTypesModel.js";
import accountTypes from "./accountTypesModel.js";

export default sequelize.define(
    'accounts',
    {
        accountsId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'accounts_id'
        },
        subAccountTypesId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'sub_account_types_id',
            references: {
                model: subAccountTypes,
                key: 'sub_account_types_id'
            }
        },
        accountTypesId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'account_types_id',
            references: {
                model: accountTypes,
                key: 'account_types_id'
            }
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'account_name'
        },
        openingBalanceDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'opening_balance_date'  
        },
        accountBalance: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'account_balance'
        },
        canDelete: {
            type: DataTypes.BOOLEAN,
            allowNull: false, 
            field:'can_delete', 
            defaultValue: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at'
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        },
        coaCode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'coa_code'
        },
    },
    {
        tableName: 'accounts',
        timestamps: true,
        paranoid: true
    }
);