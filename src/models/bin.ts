import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Warehouse from "./warehouse";

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
  },
  {
    tableName: "bins",
    timestamps: false,
  }
);

export default Bin;
