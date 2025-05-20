import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Product from "./product.model";
import SIPL from "./sipl";
import InventoryProduct from "./inventoryProduct";
import PurchaseOrder from "./purchaseOrder";
import { SLAB_STATUS } from "../constants";
import { SLAB_ENTRY_UNIT } from "../constants/tableTypes";
import SIPLProduct from "./siplProduct";

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
    slabNumber: {
      type: DataTypes.INTEGER,
    },
    combinedSlabNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entryUnit: {
      type: DataTypes.ENUM(...Object.values(SLAB_ENTRY_UNIT)),
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
    isInCart: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    landedUnitCost: {
      type: DataTypes.FLOAT,
      allowNull: true,
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
    siplProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SIPLProduct,
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "slabs",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["purchaseOrderId", "siplId", "serialNumber"],
      },
      {
        unique: true,
        fields: ["productId", "siplId", "slabNumber"],
      },
    ],
  }
);

Slab.beforeUpdate((slab) => {
  delete slab.dataValues.id;
  delete slab.dataValues.serialNumber;
  delete slab.dataValues.siplId;
  delete slab.dataValues.siplProductId;
});

export default Slab;
