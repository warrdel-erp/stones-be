import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';

export default sequelize.define(
    'clients',
    {
        clientId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            field: 'client_id',
            unique: true 
        },
        clientUuid: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
            field: 'client_uuid'
        },
        clientName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'client_name'
        },
        clientPassword: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'client_password'
        },
        clientEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'client_email'
        },
        clientLocation:{
            type: DataTypes.STRING,
            allowNull: true,
            field: 'client_location'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'createdAt'
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deletedAt'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            onUpdate: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updatedAt'
        },
        createdBy: {
            type: DataTypes.CHAR(36),
            allowNull: true,
            field: 'createdBy'
        }
    },
    {
        tableName: 'clients',
        timestamps: true,
        paranoid: true
    }
);
