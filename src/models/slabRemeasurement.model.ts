import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Slab from "./slab.model"; // Assuming you have a Slab model

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
  },
  {
    tableName: "slab_remeasurement",
    timestamps: true,
  }
);

export default SlabRemeasurement;
