import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { status, transactionStatus } from "../constant.js";
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
            allowNull: true,
            field: 'purchase_order_id',
            references: {
                model: purchaseOrders,
                key: 'purchase_order_id'
            }
        },
        totalProductCharges: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'total_product_charges',
        },
        otherChargesTotal: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'other_charges_total',
        },
        finalTotalCharges: {
            type: DataTypes.DECIMAL(10, 2), // Adjust precision and scale as needed
            allowNull: true,
            field: 'final_total_charges',
        },
        totalProductQuantity: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'total_product_quantity',
        },
        transaction: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        invoice: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        invoiceDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'invoice_date'
        },
        shipDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'ship_date'
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'due_date'
        },
        receivingInventory: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'receiving_inventory'
        },
        transactionStatus: {
            type: DataTypes.ENUM(...transactionStatus),
            allowNull: true,
            field: 'transaction_status'
        },
        container: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        freightForwarder: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        supplierSo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        paymentTerm: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        etaDate: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        deliveryType: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        shipmentTerms: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        Paymentholdreason: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        vessel: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        airBill: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        plannedExFactoryDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        exFactoryDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        departurePort: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        etdPort: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        etaPort: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        arrivalPort: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        dischargePort: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        wiringInstruction: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        purchaseLocationId: {
            type: DataTypes.INTEGER,
            allowNull: false,

        },
        shipLocationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        },
    },
    {
        tableName: 'po_supplier_invoice_mapper',
        timestamps: true,
        paranoid: true,
    }
)
