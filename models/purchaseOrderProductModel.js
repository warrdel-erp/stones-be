import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import {status} from "../constant.js";
import purchaseOrders from './purchaseOrderModel.js'
import Products from './productModel.js'

export default sequelize.define(
  'purchase_order_products',
  {
    purchaseOrderProductId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'purchase_order_product_id',
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'purchase_order_id',
        references: {
            model: purchaseOrders,
            key: 'purchase_order_id'
        }
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
    status: {
        type: DataTypes.ENUM(...status),
        allowNull: false,
        defaultValue: 'ACTIVE' // Default value is 'active'
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
    tableName: 'purchase_order_products',
    timestamps: true,
    paranoid: true, 
}
)
