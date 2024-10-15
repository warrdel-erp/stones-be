import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { country, language, supplierType, status } from '../constant.js';

export default sequelize.define(
    'suppliers',
    {
        supplierId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'supplier_id',
        },
        supplierName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'supplier_name',
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        supplierType: {
            type: DataTypes.ENUM(...supplierType),
            allowNull: true,
            field: 'supplier_type',
        },
        contactName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'contact_name',
        },
        parentLocation: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'parent_location'
        },
        printName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'print_name'
        },
        language: {
            type: DataTypes.ENUM(...language),
            allowNull: true,
        },
        parentSupplier: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'parent_supplier',
        },
        supplierSince: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'supplier_since'
        },
        port: {
            type: DataTypes.STRING,
            allowNull: true
        },
        markupMultiplier: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: "markup_multiplier",
        },
        discount: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        primaryPhoneNo: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'primary_phone_no',
        },
        secondaryPhoneNo: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'secondary_phone_no'
        },
        landlineNo: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'landline_no'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        accountingEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'accounting_email'
        },
        remitAddress: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'remit_address',
        },
        remitSuite: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'remit_suite',
        },
        remitCity: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'remit_city',
        },
        remitState: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'remit_state',
        },
        remitZip: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'remit_zip',
        },
        remitCountry: {
            type: DataTypes.ENUM(...country),
            allowNull: true,
            field: 'remit_country',
        },
        shippingAddress: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'shipping_address',
        },
        shippingSuite: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'shipping_suite',
        },
        shippingCity: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'shipping_city',
        },
        shippingState: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'shipping_state'
        },
        shippingZip: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'shipping_zip',
        },
        shippingCountry: {
            type: DataTypes.ENUM(...country),
            allowNull: true,
            field: 'shipping_country'
        },
        deliveryNotes: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'delivery_notes',
        },
        internalNotes: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'internal_notes',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
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
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'updated_by',
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at',
        },
        status: {
            type: DataTypes.ENUM(...status),
            allowNull: false,
            defaultValue: 'ACTIVE' // Default value is 'active'
        },
        paymentTerm: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "payment_term"
        },
        currency: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'suppliers',
        timestamps: true,
        paranoid: true,
    }
)
