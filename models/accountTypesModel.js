import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import {status,accountType} from '../constant.js'; 

export default sequelize.define(
    'account_types',
    {
        accountTypesId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'account_types_id'
        },
        accountType: {
            type: DataTypes.ENUM(...accountType),
            allowNull: false,
            field: 'account_type'
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
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        },
    },
    {
        tableName: 'account_types',
        timestamps: true,
        paranoid: true
    }
);