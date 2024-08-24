import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import {paymentMethod, status} from "../constant.js";
import poSupplierInvoiceMapper from './poSupplierInvoiceMapperModel.js';
import Suppliers from './supplierModel.js';

export default sequelize.define(
  'purchase_payment',
  {
    purchasePaymentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'purchase_payment_id',
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
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'supplier_id',
        references: {
            model: Suppliers,
            key: 'supplier_id'
        }
    },
    cashAccount:{
       type: DataTypes.STRING,
       allowNull: false,
       field:'cash_account',
    },
    paymentDate:{
        type: DataTypes.DATE,
        allowNull:true,
        field:'payment_date',
    },
    paymentMethod:{
        type: DataTypes.ENUM(...paymentMethod),
        allowNull: false,
        field:'payment_method',
    },
    check:{
        type: DataTypes.INTEGER,
        allowNull:true,
    },
    dateOnCheck:{
        type: DataTypes.DATE,
        allowNull:true,
        field:'date_on_check'
    },
    address:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    suite:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    city:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    state:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    zip:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    memo:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    miscellaneous:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    description:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    amount:{
        type: DataTypes.FLOAT,
        allowNull:true,
    },
    amountOnCheck:{
        type: DataTypes.FLOAT,
        allowNull:false,
        field:'amountOn_check'
    },
    amountApplied:{
        type: DataTypes.FLOAT,
        allowNull:false,
        field:'amount_applied'
    },
    unappliedBalance:{
        type: DataTypes.FLOAT,
        allowNull:false,
        field:'unapplied_balance'
    },
    internalNotes:{
        type: DataTypes.STRING,
        allowNull:true,
        field:'internal_notes'
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
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field:'created_by',
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field:'updated_by',
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field:'deleted_at'
    },
},  
{
    tableName: 'purchase_payment',
    timestamps: true,
    paranoid: true, 
}
)