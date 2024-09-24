import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import customers from './customerModel.js';
export default sequelize.define(
    'opportunity',
    {
        opportunityId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'opportunity_id'
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
        op: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // unique: true,
            field: 'op'
        },
        opDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'op_date'
        },
        customerPo: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'customer_po'
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'location'
        },
        shipTo: {
            type: DataTypes.ENUM('DELIVERY', 'PICKUP'),
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
            field: 'sub_total'
        },
        tax: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'tax'
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'total'
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
            defaultValue: 'ACTIVE',
            field: 'status'
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
            onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at'
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        }
    },
    {
        tableName: 'opportunity',
        timestamps: true,
        paranoid: true
    }
);
