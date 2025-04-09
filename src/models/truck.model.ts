import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { Client } from ".";
import { VEHICLE_TYPE } from "../constants/tableTypes";

// "name": "name",
// "vehicleType": "light",
// "registrationNumber": "234567890",
// "registrationDate": "2025-04-08",
// "capacity": "50"

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
  },
  {
    tableName: "trucks",
    timestamps: true,
  }
);

export default Truck;
