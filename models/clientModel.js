import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from 'sequelize';

export default sequelize.define(
    'clients',
    {
        clientId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true, // Make it the primary key
            field: 'client_id',
            allowNull: false
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
        clientLocation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'client_location'
        },
        clientLocationShortName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'client_location_short_name'
        },
        clientType: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'client_type'
        },
        clientAddress: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'client_address'
        },
        clientCountry: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'client_country'
        },
        clientCity: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'client_city'
        },
        pincode: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'pincode'
        },
        clientTax: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'client_tax'
        },
        clientPriceLevel: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'client_price_level'
        },
        paymentTerms: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'payment_terms'
        },
        clientLicenseNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'client_license_number'
        },
        userCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'user_count'
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
