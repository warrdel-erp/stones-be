import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { status, inventoryStock } from "../constant.js";
import Products from './productModel.js';

export default sequelize.define(
    'product_inventory',
    {
        productInventoryId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'product_inventory_id',
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'product_id',
            references: {
                model: Products,
                key: 'product_id',
            }
        },
        slabInStock: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'slab_in_stock'
        },
        quantityInStock: {
            type: DataTypes.FLOAT,
            allowNull: true,
            field: 'quantity_in_stock'
        },
        slabAvailable: {
            type: DataTypes.ENUM(...inventoryStock),
            allowNull: false,
            defaultValue: 'Available',
            field: 'slab_available'
        },
        quantityAvailable: {
            type: DataTypes.ENUM(...inventoryStock),
            allowNull: false,
            defaultValue: 'Available',
            field: 'quantity_available'
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
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        },
    },
    {
        tableName: 'product_inventory',
        timestamps: true,
        paranoid: true,
    }
)
