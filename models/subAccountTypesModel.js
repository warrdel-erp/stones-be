import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import {status,subAccountType} from '../constant.js'; 
import accountTypes from "./accountTypesModel.js";

export default sequelize.define(
    'sub_account_types',
    {
        subAccountTypesId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'sub_account_types_id'
        },
        accountTypesId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'account_types_id',
            references: {
                model: accountTypes,
                key: 'account_types_id'
            }
        },
        subAccountType: {
            type: DataTypes.ENUM(...subAccountType),
            allowNull: false,
            field: 'sub_account_type'
        },
        status: {
            type: DataTypes.ENUM(...status),
            allowNull: true,
            defaultValue: 'ACTIVE'
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
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'created_by',
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        },
    },
    {
        tableName: 'sub_account_types',
        timestamps: true,
        paranoid: true
    }
);