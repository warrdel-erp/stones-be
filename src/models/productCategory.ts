import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isSlabType: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "product_category",
    timestamps: false,
  }
);

export default ProductCategory;
