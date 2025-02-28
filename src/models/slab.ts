import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Product from "./product";
// import InventoryProduct from "./inventory_product";
import SIPL from "./sipl";
import Bin from "./bin";
import { SLAB_STATUS } from "../constants";

const Slab = sequelize.define(
  "slabs",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    entryUnit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    packageLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    packageWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    receivingLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    receivingWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    block: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SLAB_STATUS)),
      allowNull: true,
      defaultValue: SLAB_STATUS.INITIATE,
    },
    isHold: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    binId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Bin,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    siplId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SIPL,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "slabs",
    timestamps: false,
  }
);

export default Slab;
