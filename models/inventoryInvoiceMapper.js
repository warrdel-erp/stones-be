import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import productInventory from "./productInventoryModel.js";
import poSupplierInvoice from "./poSupplierInvoiceModel.js"

export default sequelize.define(
  'inventory_invoice_mapper',
  {
    inventoryInvoiceMapperId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'inventory_invoice_mapper_id',
    },
    productInventoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_inventory_id',
        references: {
            model: productInventory,
            key: 'product_inventory_id',
        }
    },
    poSupplierInvoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'po_supplier_invoice_id',
        references: {
            model: poSupplierInvoice,
            key: 'po_supplier_invoice_id',
        }
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
    tableName: 'inventory_invoice_mapper',
    timestamps: true,
    paranoid: true, 
}
)