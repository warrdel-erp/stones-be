import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { status } from "../constant.js";

export default sequelize.define(
  'locations',
  {
    locationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'location_id'
    },
    location:{
        type:DataTypes.STRING,
        allowNull: false,
        unique:true,
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    suite:{
        type:DataTypes.STRING,
        allowNull:false
    },
    city:{
        type:DataTypes.STRING,
        allowNull:false
    },
    state:{
        type:DataTypes.STRING,
        allowNull:false
    },
    zip:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    country:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status: {
        type: DataTypes.ENUM(...status),
        allowNull: false,
        defaultValue: 'ACTIVE' // Default value is 'active'
    },
    purchaseLocation:{
        type: DataTypes.BOOLEAN,  
        allowNull: false, 
        field:'purchase_location', 
        defaultValue: false  // Default value for this field is FALSE 
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
        field:'updated_at',
    },
    deletedAt: {
        type: DataTypes.TIME,
        allowNull: true,
        field:'deleted_at',
    },
},  
{
    tableName: 'locations',
    timestamps: true,
    paranoid: true,
}
)
