import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct";
import PackagingList from "./packagingList.model";

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
  },
  {
    tableName: "packaging_list_products",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["packagingListId", "inventoryProductId"], // Composite unique constraint
      },
    ],
  }
);

// Hook to prevent updating inventoryProductId and packagingListId by removing them from update payload
PackagingListProduct.beforeUpdate((product: any) => {
  delete product.dataValues.packagingListId;
  delete product.dataValues.inventoryProductId;
});

export default PackagingListProduct;
