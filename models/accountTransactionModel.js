import { DataTypes } from "sequelize";
import sequelize from "../database/sequelizeConfig.js";
import { paymentMethod, status } from "../constant.js";

export default sequelize.define('account_transaction', {
    accountTransactionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'account_transaction_id'
    },
    poSupplierInvoiceMapperId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'po_supplier_invoice_mapper',
            key: 'po_supplier_invoice_mapper_id'
        },
        field: 'po_supplier_invoice_mapper_id'
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'purchase_orders',
            key: 'purchase_order_id'
        },
        field: 'purchase_order_id'
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'suppliers',
            key: 'supplier_id'
        },
        field: 'supplier_id'
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'customers',
            key: 'customer_id'
        },
        field: 'customer_id'
    },
    soLoadingOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'so_loading_order',
            key: 'so_loading_order_id'
        },
        field: 'so_loading_order_id'
    },
    so: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'sales_orders',
            key: 'so'
        },
        field: 'so'
    },
    transactionOf: {
        type: DataTypes.ENUM('sales', 'purchase'),
        allowNull: false,
        field: 'transaction_of'
    },
    transactionAmount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'transaction_amount'
    },
    transactionAmountDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'transaction_amount_date'
    },
    transactionAmountType: {
        type: DataTypes.ENUM('debit', 'credit'),
        allowNull: false,
        field: 'transaction_amount_type'
    },
    accountsId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'accounts_id'
        },
        field: 'accounts_id'
    },
    entryType: {
        type: DataTypes.ENUM('dr', 'cr'),
        allowNull: false,
        field: 'entry_type'
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'payment_method'
    },
    check: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'check'
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'address'
    },
    suite: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'suite'
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'city'
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'state'
    },
    zip: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'zip'
    },
    memo: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'memo'
    },
    miscellaneous: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'miscellaneous'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'description'
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'amount'
    },
    amountOnCheck: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'amountOn_check'
    },
    amountApplied: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'amount_applied'
    },
    unappliedBalance: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'unapplied_balance'
    },
    internalNotes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'internal_notes'
    },
    status: {
        type: DataTypes.ENUM(...status),
        allowNull: true,
        defaultValue: 'ACTIVE',
        field: 'status'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
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
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
    }
}, {
    tableName: 'account_transaction',
    timestamps: true,
    paranoid: true
},
    {
        tableName: 'account_transaction',
        timestamps: true,
        paranoid: true,
    });

