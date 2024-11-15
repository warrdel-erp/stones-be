import { deliveryType, freightForwarder, shipmentTerm, status } from "../constant.js";
import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';

export default sequelize.define(
    'InventoryTransfer',
    {
        inventoryTransferId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'inventory_transfer_id'
        },
        poSlabDetailId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'po_slab_details',
                key: 'po_slab_detail_id'
            },
            onDelete: 'SET NULL',
            field: 'po_slab_detail_id'
        },
        initiatedDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'initiated_date'
        },
        requiredShipDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'required_ship_date'
        },
        etaDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'eta_date'
        },
        deliveryMethod: {
            type: DataTypes.ENUM(...deliveryType),
            allowNull: false,
            field: 'delivery_method'
        },
        shipmentTerms: {
            type: DataTypes.ENUM(...shipmentTerm),
            allowNull: true,
            field: 'shipment_terms'
        },
        transferFrom: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'transfer_from'
        },
        transferTo: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'transfer_to'
        },
        freightForwarder: {
            type: DataTypes.ENUM(...freightForwarder),
            allowNull: true,
            field: 'freight_forwarder'
        },
        trackingId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'tracking_id'
        },
        actualShipDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'actual_ship_date'
        },
        pickTicketRestriction: {
            type: DataTypes.ENUM('Exact Slab', 'Within Lot', 'Within Product'),
            allowNull: true,
            field: 'pick_ticket_restriction'
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
            field:'updated_at'
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        },
    },
    {
        tableName: 'inventory_transfer',
        timestamps: true,
        paranoid: true
    }
);
