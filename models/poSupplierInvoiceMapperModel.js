import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import {status} from "../constant.js";
import purchaseOrders from './purchaseOrderModel.js'

export default sequelize.define(
  'po_supplier_invoice_mapper',
  {
    poSupplierInvoiceMappperId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'po_supplier_invoice_mapper_id',
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'purchase_order_id',
        references: {
            model: purchaseOrders,
            key: 'purchase_order_id'
        }
    },
    totalProductCharges:{
        type:DataTypes.FLOAT,
        allowNull:true,
        field:'total_product_charges',
    },
    otherChargesTotal:{
        type:DataTypes.FLOAT,
        allowNull:true,
        field:'other_charges_total',
    },
    finalTotalCharges:{
        type:DataTypes.DECIMAL(10, 2), // Adjust precision and scale as needed
        allowNull:true,
        field: 'final_total_charges',
    }, 
    transaction:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    invoice:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    invoiceDate:{
        type : DataTypes.DATE,
        allowNull:false,
        field : 'invoice_date'
    },
    shipDate:{
        type : DataTypes.DATE,
        allowNull:false,
        field : 'ship_date'
    },
    dueDate:{
        type : DataTypes.DATE,
        allowNull:false,
        field : 'due_date'
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
    tableName: 'po_supplier_invoice_mapper',
    timestamps: true,
    paranoid: true, 
}
)
