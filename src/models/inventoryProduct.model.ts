import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Bin from "./bin.model";
import SIPL from "./sipl.model";
import { INVENTORY_ITEM_STATUS } from "../constants";
import Product from "./product.model";
import Client from "./client.model";
import Location from "./location.model";
import { v4 as uuidv4 } from "uuid";

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
      allowNull: true,
      references: {
        model: Bin,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    siplId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    landedUnitCost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(INVENTORY_ITEM_STATUS)),
      allowNull: true,
      defaultValue: INVENTORY_ITEM_STATUS.INITIATE,
    },
    combinedNumber: {
      type: DataTypes.STRING,
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
      onDelete: "RESTRICT",
    },
    isSlabType: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    qrCode: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    receivedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    FOBcost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    secondaryStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assetValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "inventory_products",
    timestamps: true,
  }
);

InventoryProduct.beforeCreate(async (inventoryProduct: any) => {
  if (!inventoryProduct.qrCode) {
    inventoryProduct.qrCode = uuidv4();
  }
});

InventoryProduct.beforeBulkCreate(async (inventoryProducts: any[]) => {
  for (const product of inventoryProducts) {
    if (!product.qrCode) {
      product.qrCode = uuidv4();
    }
  }
});

// Scope configuration for InventoryProduct model
(InventoryProduct as any).scopeConfig = {
  client: true,
  location: true,
};

export default InventoryProduct;

InventoryProduct.beforeUpdate((inventoryProduct) => {
  delete inventoryProduct.dataValues.id;
  delete inventoryProduct.dataValues.combinedNumber;
  delete inventoryProduct.dataValues.siplId;
  delete inventoryProduct.dataValues.productId;
}); 