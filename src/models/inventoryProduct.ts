import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Bin from "./bin";
import SIPL from "./sipl.model";

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
    siplId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SIPL,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    sellingPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    combinedNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: "unique_combinedNumber_constraint",
        msg: "unique combined number",
      },
    },
    isSlabType: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: "inventory_products",
    timestamps: true,
  }
);

export default InventoryProduct;

InventoryProduct.beforeUpdate((inventoryProduct) => {
  delete inventoryProduct.dataValues.id;
  delete inventoryProduct.dataValues.combinedNumber;
  delete inventoryProduct.dataValues.siplId;
});