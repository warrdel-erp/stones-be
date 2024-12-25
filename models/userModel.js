import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';

export default sequelize.define(
  'users',
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,

    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userid: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'created_at'
    },
    lastSelectedLocation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field:'last_selected_location',
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'updated_at'
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'deleted_at'
    },
},  
{
    tableName: 'users',
    timestamps: true
}
)