import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { status } from "../constant.js";
import purchaseOrderProduct from '../models/purchaseOrderProductModel.js'

export default sequelize.define(
    'pre_purchase_orders',
    {
        prePurchaseOrderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'pre_purchase_order_id',
        },
        purchaseOrderProductId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'purchase_order_product_id',
            references: {
                model: purchaseOrderProduct,
                key: 'purchaseOrderProductId'
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        supplierNote: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'supplier_note',
        },
        purchaseQuantity: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'purchase_quantity'
        },
        // purchaseUom:{
        //     type: DataTypes.STRING,
        //     allowNull: true,
        //     field: 'purchase_uom'
        // },
        unitPrice: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'unit_price',
        },
        minimumLength: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'minimum_length',
        },
        minimumWidth: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'minimum_width',
        },
        bundles: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        slabsBundles: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'slab_bundles',
        },
        slabs: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        poQty: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field : 'po_qty'
        },
        finalUnitPrice: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'final_unit_price',
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'total_price'
        },
        status: {
            type: DataTypes.ENUM(...status),
            allowNull: false,
            defaultValue: 'ACTIVE' // Default value is 'active'
        },
        createdAt: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.TIME,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at'
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
        deletedAt: {
            type: DataTypes.TIME,
            allowNull: true,
            field: 'deleted_at'
        },
    },
    {
        tableName: 'pre_purchase_orders',
        timestamps: true,
        paranoid: true,
    }
)