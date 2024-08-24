import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { status, deliveryTypeSales } from "../constant.js";
import customers from "./customerModel.js";

export default sequelize.define(
    'sales_orders',
    {
        salesOrdersId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'sales_orders_id',
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'customer_id',
            references: {
                model: customers,
                key: 'customer_id'
            }
        },
        so: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        soDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'so_date',
        },
        customerPo: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'customer_po',
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        shipTo: {
            type: DataTypes.ENUM(...deliveryTypeSales),
            allowNull: false,
            field: 'ship_to'
        },
        specialInstruction: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'special_instruction'
        },
        internalNotes: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'internal_notes'
        },
        printedNotes: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'printed_notes'
        },
        subTotal: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'sub_total',
        },
        salesTax: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'sales_tax'
        },
        tax: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: true,
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
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'created_by',
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'updated_by',
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
        tableName: 'sales_orders',
        timestamps: true,
        paranoid: true,
    }
)
