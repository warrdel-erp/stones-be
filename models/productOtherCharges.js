import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import purchaseOrders from '../models/purchaseOrderModel.js'

export default sequelize.define(
  'product_other_charges',
  {
    productOtherChargesId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'product_other_charges_id',
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
    account:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    chargeType:{
        type:DataTypes.STRING,
        allowNull:true,
        field:'charge_type'
    },
    charge:{
        type:DataTypes.FLOAT,
        allowNull:true,
    },
    description:{
        type :DataTypes.STRING,
        allowNull:true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'created_at',
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
        type: DataTypes.TIME,
        allowNull: true,
        field:'deleted_at'
    },
},  
{
    tableName: 'product_other_charges',
    timestamps: true,
    paranoid: true, 
}
)
