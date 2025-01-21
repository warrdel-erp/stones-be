import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { poSlabDetailStatus, slabBinEnum } from "../constant.js";
import poSupplierInvoice from "./poSupplierInvoiceModel.js";
import poSupplierInvoiceMapper from "./poSupplierInvoiceMapperModel.js";

export default sequelize.define(
    'po_slab_details',
    {
        poSlabDetailId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'po_slab_detail_id',
        },
        poSupplierInvoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'po_supplier_invoice_id',
            references: {
                model: poSupplierInvoice,
                key: 'po_supplier_invoice_id'
            }
        },
        poSupplierInvoiceMapperId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'po_supplier_invoice_mapper_id',
            references: {
                model: poSupplierInvoiceMapper,
                key: 'po_supplier_invoice_mapper_id'
            }
        },
        serialNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'serial_number',
        },
        entryUnit: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'entry_unit',
        },
        packageLength: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'package_length'
        },
        packageWidth: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'package_width'
        },
        recevingLength: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'receving_length'
        },
        recevingWidth: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'receving_width'
        },
        block: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        lot: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        slab: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        bin: {
            type: DataTypes.ENUM(...slabBinEnum),
            allowNull: false,
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        slabCounter: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'slab_counter',
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        locationId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'location_id'
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'product_id'
        },
        status: {
            type: DataTypes.ENUM(...poSlabDetailStatus),
            allowNull: false,
            defaultValue: 'INITIATED'
        },
        addedToSelectionSheet: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,  // Default value is false (0)
        },
        slabAddedToCart: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,  // Default value is false (0),
            field: 'slab_added_to_cart'
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
        tableName: 'po_slab_details',
        timestamps: true,
        paranoid: true,
    }
)
