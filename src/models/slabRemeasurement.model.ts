import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Slab from "./slab.model"; // Assuming you have a Slab model
import Client from "./client.model";

const SlabRemeasurement = sequelize.define(
  "SlabRemeasurement",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    length: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    width: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    slabId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Slab,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    tableName: "slab_remeasurements",
    timestamps: true,
  }
);

// Scope configuration for SlabRemeasurement model
(SlabRemeasurement as any).scopeConfig = {
  client: true,
  location: false,
};

export default SlabRemeasurement;
