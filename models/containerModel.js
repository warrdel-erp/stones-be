import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { status } from "../constant.js";
import poSupplierInvoiceMapper from './poSupplierInvoiceMapperModel.js';

export default sequelize.define(
    'container',
    {
        containerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'container_id',
        },
        poSupplierInvoiceMapperId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'po_supplier_invoice_mapper_id',
            references: {
                model: poSupplierInvoiceMapper,
                key: 'po_supplier_invoice_mapper_id',
            }
        },
        containerNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'container_number',
        },
        receivedOn: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'received_on',
        },
        receivedBy: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'received_by',
        },
        notes: {
            type: DataTypes.STRING,
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
        tableName: 'container',
        timestamps: true,
        paranoid: true,
    }
)