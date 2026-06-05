import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { Client, SalesOrderInvoice } from ".";
import { VEHICLE_TYPE, TRUCK_STATUS } from "../constants/tableTypes";

const Truck = sequelize.define(
  "Truck",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registrationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
    },
    vehicleType: {
      type: DataTypes.ENUM(...Object.values(VEHICLE_TYPE)),
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    driverUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TRUCK_STATUS)),
      allowNull: false,
      defaultValue: TRUCK_STATUS.AVAILABLE,
    },
  },
  {
    tableName: "trucks",
    timestamps: true,
  }
);

// Scope configuration for Truck model
(Truck as any).scopeConfig = {
  client: true,
  location: false,
};

export default Truck;
