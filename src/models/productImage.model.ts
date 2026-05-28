import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Product from "./product.model";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    s3FileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Reference to the s3_files record for this image",
    },
  },
  {
    tableName: "product_images",
    timestamps: true,
  }
);

export default ProductImage;
