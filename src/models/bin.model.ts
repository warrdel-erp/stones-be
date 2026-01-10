import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Warehouse from "./warehouse.model";
import Client from "./client.model";
import Location from "./location.model";

const Bin = sequelize.define(
  "bins",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Warehouse,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "bins",
    timestamps: true,
  }
);

// Scope configuration for Bin model
(Bin as any).scopeConfig = {
  client: true,
  location: true,
};

export default Bin;
