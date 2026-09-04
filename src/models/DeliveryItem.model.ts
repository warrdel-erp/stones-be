import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import DeliveryAddress from './DeliveryAddress.model';
import Delivery from './Delivery.model';
import Client from './client.model';
import SalesOrderProduct from './salesOrderProduct.model';

const DeliveryItem = sequelize.define(
  'DeliveryItem',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    deliveryAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: DeliveryAddress, key: 'id' },
      onDelete: 'CASCADE', onUpdate: 'CASCADE',
    },
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
    salesOrderProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: SalesOrderProduct, key: 'id' },
      onDelete: 'RESTRICT', onUpdate: 'CASCADE',
    },
  },
  { tableName: 'delivery_items', timestamps: true }
);

(DeliveryItem as any).scopeConfig = { client: true, location: false };

export default DeliveryItem;
