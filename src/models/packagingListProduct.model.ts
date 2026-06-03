import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import PackagingList from "./packagingList.model";
import SalesOrderProduct from "./salesOrderProduct.model";
import Client from "./client.model";

const PackagingListProduct = sequelize.define(
  "PackagingListProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    remeasureLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    remeasureWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    slabPicked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isSwapped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      allowNull: false,
    },
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InventoryProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    packagingListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PackagingList,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    salesOrderProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrderProduct,
        key: "id",
      },
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
  },
  {
    tableName: "packaging_list_products",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["packagingListId", "inventoryProductId"], // Composite unique constraint
      },
      {
        unique: true,
        fields: ["salesOrderProductId"], // Composite unique constraint
      },
    ],
  }
);

// Hook to prevent updating inventoryProductId and salesOrderId by removing them from update payload
PackagingListProduct.beforeUpdate((product: any) => {
  // only can change inventoryProductId if it is swapping.
  if (!product.dataValues.isSwapping) {
    delete product.dataValues.inventoryProductId;
  }
  delete product.dataValues.salesOrderProductId;
  delete product.dataValues.packagingListId;
});

// Scope configuration for PackagingListProduct model
(PackagingListProduct as any).scopeConfig = {
  client: true,
  location: false,
};

export default PackagingListProduct;
