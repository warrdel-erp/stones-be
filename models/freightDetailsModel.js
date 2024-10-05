import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';

export default sequelize.define(
    'freightBillDetails',
    {
        detailId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'detail_id'
        },
        freightBillsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'freightBills',
                key: 'freight_bills_id'
            },
            field: 'freight_bills_id'
        },
        accountsId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'accounts_id'
        },
        locations: {
            type: DataTypes.STRING,
            allowNull: true
        },
        services: {
            type: DataTypes.STRING,
            allowNull: true
        },
        purchasedAs: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'purchased_as'
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        extended: {
            type: DataTypes.STRING,
            allowNull: true
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
        tableName: 'freightBillDetails',
        timestamps: true,
        paranoid: true
    }
);
