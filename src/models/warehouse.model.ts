import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Location from "./location.model";
import Client from "./client.model";

const Warehouse = sequelize.define(
  "warehouses",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
  },
  {
    tableName: "warehouses",
    timestamps: true,
  }
);

// Scope configuration for Warehouse model
(Warehouse as any).scopeConfig = {
  client: true,
  location: true,
};

export default Warehouse;
