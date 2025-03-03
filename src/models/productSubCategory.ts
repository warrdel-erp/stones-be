import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import ProductCategory from "./productCategory";

const ProductSubCategory = sequelize.define(
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
      unique: {
        name: "unique_name_no_constraint",
        msg: "unique name_no",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: ProductCategory,
        key: "id",
      },
    },
  },
  {
    tableName: "product_sub_category",
    timestamps: false,
  }
);

export default ProductSubCategory;
