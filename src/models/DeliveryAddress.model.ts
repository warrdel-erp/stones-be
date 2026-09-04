import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import Delivery from './Delivery.model';
import Client from './client.model';

const DeliveryAddress = sequelize.define(
  'DeliveryAddress',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    deliveryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Delivery, key: 'id' },
      onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Client, key: 'id' },
      onDelete: 'RESTRICT', onUpdate: 'CASCADE',
    },
    fromLat: { type: DataTypes.FLOAT, allowNull: false },
    fromLng: { type: DataTypes.FLOAT, allowNull: false },
    fromAddress: { type: DataTypes.TEXT, allowNull: false },
    toLat: { type: DataTypes.FLOAT, allowNull: false },
    toLng: { type: DataTypes.FLOAT, allowNull: false },
    toAddress: { type: DataTypes.TEXT, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    referenceType: {
      type: DataTypes.ENUM('packagingList', 'loadingOrder'),
      allowNull: false,
    },
    referenceId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: 'delivery_addresses', timestamps: true }
);

(DeliveryAddress as any).scopeConfig = { client: true, location: false };

export default DeliveryAddress;
