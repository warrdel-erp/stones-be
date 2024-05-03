import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import {status} from "../constant.js";
import poSupplierInvoiceMapper from "./poSupplierInvoiceMapperModel.js";
import purchaseOrderProduct from '../models/purchaseOrderProductModel.js'

export default sequelize.define(
  'po_supplier_invoice',
  {
    poSupplierInvoiceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'po_supplier_invoice_id',
    },
    poSupplierInvoiceMappperId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'po_supplier_invoice_mapper_id',
        references: {
            model: poSupplierInvoiceMapper,
            key: 'po_supplier_invoice_mapper_id'
        }
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
    productSku:{
        type:DataTypes.STRING,
        field:'product_sku',
        allowNull:false
    },
    description:{
        type:DataTypes.STRING,
        allowNull:true,
    },    
    supplierNotes:{
        type:DataTypes.STRING,
        allowNull:true,
        field:'supplier_notes'
    },
    slab:{
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    sqm:{
        type:DataTypes.FLOAT,
        allowNull:true,
    },
    uom:{
        type:DataTypes.FLOAT,
        allowNull:true,
    },
    quantity:{
        type:DataTypes.FLOAT,
        allowNull:true,
    },
    unitPrice:{
        type:DataTypes.FLOAT,
        allowNull:true,
        field:'unit_price'
    },
    totalPerUnit:{
        type:DataTypes.FLOAT,
        allowNull:true,
        field:'total_per_unit',
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
        field:'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'updated_at'
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field:'deleted_at'
    },
},  
{
    tableName: 'po_supplier_invoices',
    timestamps: true,
    paranoid: true, 
}
)
