
import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import {status,salesStatus} from "../constant.js";
import salesOrders from "./salesOrderModel.js";
import poSlabDetails from "./poSlabDetailModel.js";
import productInventory from "./productInventoryModel.js";
import soLoadingOrder from "./soLoadingOrderModel.js";

export default sequelize.define(
  'sales_orders_inventory',
  {
    salesOrdersInventoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'sales_orders_inventory_id',
    },
    salesOrdersId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sales_orders_id',
        references: {
            model: salesOrders,
            key: 'sales_orders_id'
        }
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
    soLoadingOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'so_loading_order_id',
        references: {
            model: soLoadingOrder,
            key: 'so_loading_order_id'
        }
    },
    unitPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'unit_price',
    },
    salesStatus:{
        type: DataTypes.ENUM(...salesStatus),
        allowNull: false,
        defaultValue: 'INITIATED', // Default value is 'INITIATED'
        field:'sales_status'
    },
    remeasureLength: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'remeasure_length',
    },
    remeasureWidth: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: 'remeasure_width',
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
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field:'deleted_at'
    },
},  
{
    tableName: 'sales_orders_inventory',
    timestamps: true,
    paranoid: true, 
},
);