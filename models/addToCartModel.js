import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import poSlabDetails from "./poSlabDetailModel.js";

const AddToCart = sequelize.define(
    'add_to_cart',
    {
        cartId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'cart_id',
        },
        poSlabDetailId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'po_slab_detail_id',
            references: {
                model: poSlabDetails,
                key: 'po_slab_detail_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'created_by',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at',
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at',
        },
    },
    {
        tableName: 'add_to_cart',
        timestamps: true,
        paranoid: true,
    }
);

export default AddToCart;
