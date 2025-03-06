import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Product from "./product";
// import InventoryProduct from "./inventory_product";
import SIPL from "./sipl";
import Bin from "./bin";
import { SLAB_STATUS } from "../constants";
import InventoryProduct from "./inventoryProduct";
import PurchaseOrder from "./purchaseOrder";

const Slab = sequelize.define(
  "slabs",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serialNumber: {
      type: DataTypes.INTEGER,
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
      unique: {
        name: "unique_barcode_constraint",
        msg: "unique barcode",
      },
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
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InventoryProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "slabs",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["purchaseOrderId", "siplId", "serialNumber"],
      },
    ],
  }
);

Slab.beforeUpdate((slab: any) => {
  Slab.findOne({
    where: { siplId: slab.siplId, serialNumber: slab.serialNumber },
  });
});

export default Slab;
