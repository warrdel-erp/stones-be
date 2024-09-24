import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import opportunity from './opportunityModel.js';
import productInventory from './productInventoryModel.js';
import poSlabDetails from './poSlabDetailModel.js';

export default sequelize.define(
    'opportunity_selection_sheet',
    {
        opSelectionId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'op_selection_id'
        },
        opportunityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'opportunity_id',
            references: {
                model: opportunity,
                key: 'opportunity_id'
            }
        },
        selectionSheetId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'selection_sheet_id',
        },
        productInventoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_inventory_id',
            references: {
                model: productInventory,
                key: 'product_inventory_id'
            }
        },
        poSlabDetailId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'po_slab_detail_id',
            references: {
                model: poSlabDetails,
                key: 'po_slab_detail_id'
            }
        },
        status: {
            type: DataTypes.ENUM('HOLD', 'SALES ORDER'),
            allowNull: true,
            field: 'status'
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
    },
    {
        tableName: 'opportunity_selection_sheet',
        timestamps: false
    }
);
