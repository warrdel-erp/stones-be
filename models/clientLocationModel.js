import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';
import locationModel from "./locationModel.js";
import clientModel from "./clientModel.js";

export default sequelize.define(
    'clientLocations',
    {
        clientLocationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'client_location_id'
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'client_id',
            references: {
                model: clientModel,
                key: 'client_id'
            }
        },
        locationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'location_id',
            references: {
                model: locationModel,
                key: 'location_id'
            }
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
        }
    },
    {
        tableName: 'client_locations',
        timestamps: true,
        paranoid: true
    }
);
