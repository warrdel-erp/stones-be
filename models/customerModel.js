import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import { country, customerType, paymentTerms, priceLevel, reasons, wayOfDocsSend } from '../constant.js';



export default sequelize.define(
  'customers',
  {
    customerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'customer_id'
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'customer_name'
    },
    customerType: {
      type: DataTypes.ENUM(...customerType),
      allowNull: true,
      field: 'customer_type'
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_name'
    },
    printName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'print_name'
    },
    parentCustomer: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'parent_customer'
    },
    primaryPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'primary_phone_number'
    },
    secondaryPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'secondary_phone_number'
    },
    landlineNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'landline_number'
    },
    accEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'acc_email'
    },
    emails: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    suite: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.ENUM(...country),
      allowNull: true
    },
    sAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 's_address'
    },
    sUnit: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 's_unit'
    },
    sCity: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 's_city'
    },
    sZip: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 's_zip'
    },
    sState: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 's_state'
    },
    sSountry: {
      type: DataTypes.ENUM(...country),
      allowNull: true,
      field: 's_country'
    },

    pSalesPerson: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'p_sales_person'
    },
    priceLevel: {
      type: DataTypes.ENUM(...priceLevel),
      allowNull: true,
      field: 'price_level'
    },
    taxExempt: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tax_exempt'
    },
    salesTax: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'sales_tax'
    },
    paymentTerms: {
      type: DataTypes.ENUM(...paymentTerms),
      allowNull: true,
      field: 'payment_terms'
    },
    exemptCerti: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'exempt_certi'
    },
    exemptExipry: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'exempt_exipry'
    },
    internalNotes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'internal_notes'
    },
    deliveryNotes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'delivery_notes'
    },
    poRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'po_required'
    },
    applyFinanceCharges: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'apply_finance_charges'
    },
    preferredDocSend: {
      type: DataTypes.ENUM(...wayOfDocsSend),
      allowNull: true,
      field: 'preferred_way_docs'
    },
    daysForGrace: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'days_grace'
    },
    daysForHold: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'days_hold'
    },
    customerSince: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'customerSince'
    },
    einNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ein_number'
    },
    reason: {
      type: DataTypes.ENUM(...reasons),
      allowNull: true,
      field: 'reason'
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
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), // Assuming you have a status enum
      allowNull: true,
      defaultValue: 'ACTIVE'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by',
    }
  },
  {
    tableName: 'customers',
    timestamps: true,
    paranoid: true
  }
);
