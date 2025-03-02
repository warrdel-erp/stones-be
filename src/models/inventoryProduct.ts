import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Bin from "./bin";

const InventoryProduct = sequelize.define(
  "InventoryProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    binId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Bin,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "inventory_products",
    timestamps: true,
  }
);

export default InventoryProduct;
