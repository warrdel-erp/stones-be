import { DataTypes } from "sequelize";
import User from "./user";
import { sequelize } from "../config/database";
import ProductCategory from "./productCategory";
import ProductSubCategory from "./productSubCategory";
import { PRODUCT_COLORS } from "../constants";

const Product = sequelize.define(
  "products",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alternativeName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    baseColor: {
      type: DataTypes.ENUM(...Object.values(PRODUCT_COLORS)),
      allowNull: true,
    },
    group: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    origin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uom: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    finish: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    thickness: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specialInstruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    disclaimer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductCategory,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    subCategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: ProductSubCategory,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    paranoid: true, // Enables soft delete functionality
  }
);

// **Relations**

export default Product;
