import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { Client } from ".";

const Truck = sequelize.define(
  "Truck",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driverName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driverPhone: {
      type: DataTypes.STRING,
      allowNull: true,
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
