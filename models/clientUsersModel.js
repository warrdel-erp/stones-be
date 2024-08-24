import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelizeConfig.js';

 export default sequelize.define(
    'client_users',
    {
        clientUserId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'client_user_id'
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'clients', 
                key: 'client_id'
            },
            field: 'client_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users', 
                key: 'id'
            },
            field: 'user_id'
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
        }
    },
    {
        tableName: 'client_users',
        timestamps: true, 
        paranoid: true
    }
);


