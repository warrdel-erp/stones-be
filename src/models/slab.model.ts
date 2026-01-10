import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Product from "./product.model";
import SIPL from "./sipl.model";
import InventoryProduct from "./inventoryProduct.model";
import PurchaseOrder from "./purchaseOrder.model";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { SLAB_ENTRY_UNIT } from "../constants/tableTypes";
import SIPLProduct from "./siplProduct.model";
import Client from "./client.model";
import Location from "./location.model";
import _ from "lodash";

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
    packagedSqrFt: {
      type: DataTypes.VIRTUAL,
      get() {

        const length = Number(this.get("packageLength")) || 0;
        const width = Number(this.get("packageWidth")) || 0;

        return _.round(length * width / 144, 2);
      },
    },
    receivedSqrFt: {
      type: DataTypes.VIRTUAL,
      get() {
        const length = Number(this.get("receivingLength")) || 0;
        const width = Number(this.get("receivingWidth")) || 0;

        return _.round(length * width / 144, 2);
      },

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
    /**
     * @deprecated
     */
    status: {
      type: DataTypes.ENUM(...Object.values(INVENTORY_ITEM_STATUS)),
      allowNull: true,
      defaultValue: INVENTORY_ITEM_STATUS.INITIATE,
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
    isBroken: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    parentSlabId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "slabs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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

// Scope configuration for Slab model
(Slab as any).scopeConfig = {
  client: true,
  location: true,
};

export default Slab;
