
import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { status, salesStatus } from "../constant.js";
import salesOrders from "./salesOrderModel.js";

export default sequelize.define(
    'so_loading_order',
    {
        soLoadingOrderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'so_loading_order_id',
        },
        salesOrdersId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'sales_orders_id',
            references: {
                model: salesOrders,
                key: 'sales_orders_id'
            }
        },
        // packingListId: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true,
        //     field: 'packing_list_id',
        // },
        subTotal: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'sub_total',
        },
        tax: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        salesStatus: {
            type: DataTypes.ENUM(...salesStatus),
            allowNull: false,
            defaultValue: 'INITIATED', // Default value is 'INITIATED'
            field: 'sales_status'
        },
        status: {
            type: DataTypes.ENUM(...status),
            allowNull: false,
            defaultValue: 'ACTIVE' // Default value is 'active'
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
        tableName: 'so_loading_order',
        timestamps: true,
        paranoid: true,
    },
);