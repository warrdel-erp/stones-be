import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Location from "./location.model";

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
  },
  {
    tableName: "warehouses",
    timestamps: true,
  }
);

export default Warehouse;
