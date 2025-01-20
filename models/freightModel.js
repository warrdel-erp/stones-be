import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import { country, paymentTerms, status } from "../constant.js";

export default sequelize.define(
  'freight_Bills',
  {
    freightBillsId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'freight_bills_id'
    },
    poSupplierInvoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'po_supplier_invoice_id'
    },
    poSupplierInvoiceMapperId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'po_supplier_invoice_mapper_id'
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'transaction_id'
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'vendor_id'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoice: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoiceDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'invoice_date'
    },
    paymentTerms: {
      type: DataTypes.ENUM(...paymentTerms),
      allowNull: true,
      field: 'payment_terms'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date'
    },
    contactsLocation: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contacts_location'
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'address_2'
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
    printedNotes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'printed_notes'
    },
    internalNotes: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'internal_notes'
    },
    subTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sub_total'
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unitFright: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'unit_fright'
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE'
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
    tableName: 'freightBills',
    timestamps: true,
    paranoid: true
  }
);
