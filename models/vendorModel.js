import { country, paymentTerms, supplierType } from "../constant.js";
import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';

const vendorModel = sequelize.define('vendors', {
    vendorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'vendor_id'
    },
    vendorName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'vendor_name'
    },
    code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'code'
    },
    vendorType: {
        type: DataTypes.ENUM(supplierType),
        allowNull: true,
        field: 'vendor_type'
    },
    contactName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'contact_name'
    },
    vendorSince: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'vendor_since'
    },
    primaryPhoneNo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: 'primary_phone_no'
    },
    secondaryPhoneNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'secondary_phone_no'
    },
    landlineNo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'landline_no'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'email'
    },
    accountingEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'accounting_email'
    },
    remitAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'remit_address'
    },
    remitSuite: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'remit_suite'
    },
    remitCity: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'remit_city'
    },
    remitState: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'remit_state'
    },
    remitZip: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'remit_zip'
    },
    remitCountry: {
        type: DataTypes.ENUM(...country),
        allowNull: true,
        field: 'remit_country'
    },
    shippingAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'shipping_address'
    },
    shippingSuite: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'shipping_suite'
    },
    shippingCity: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'shipping_city'
    },
    shippingState: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'shipping_state'
    },
    shippingZip: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'shipping_zip'
    },
    shippingCountry: {
        type: DataTypes.ENUM(...country),
        allowNull: true,
        field: 'shipping_country'
    },
    paymentTerms: {
        type: DataTypes.ENUM(paymentTerms),
        allowNull: true,
        field: 'payment_terms'
    },
    currency: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'currency'
    },
    defaultExpenseAccount: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'default_expense_account'
    },
    defaultPaymentMethod: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'default_payment_method'
    },
    account: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'account'
    },
    einNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'ein_number'
    },
    memoOnCheck: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'memo_on_check'
    },
    genericVendor: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'generic_vendor'
    },
    formUsVendor: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'form_us_vendor'
    },
    freightCarrier: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'freight_carrie'
    },
    subContractor: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'sub_contractor'
    },
    allowVendorLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'allow_vendor_login'
    },
    internalNotes: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'internal_notes'
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
}, {
    tableName: 'vendors',
    timestamps: true,
    paranoid: true
});

export default vendorModel;
