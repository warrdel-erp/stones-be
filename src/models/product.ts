import { DataTypes, Model } from "sequelize";
import User from "./user";
import { sequelize } from "../config/database";
import ProductCategory from "./productCategory";
import ProductSubCategory from "./productSubCategory";
import { PRODUCT_COLORS } from "../constants";
import { AppError } from "../helper/appError";
import { CustomUpdateOptions } from "../types/custom";
import Bin from "./bin";

const Product = sequelize.define(
  "products",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
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
    kind: {
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
    singleSlabPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    bundlePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    reorderQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    safetyQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    binId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Bin,
        key: "id",
      },
      onDelete: "NO ACTION",
      onUpdate: "CASCADE",
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

Product.beforeUpdate((product, options) => {
  const customOptions = options as CustomUpdateOptions;

  if (product.get({ plain: true }).createdBy !== customOptions.userId) {
    throw new AppError("You can't update this product because you haven't created it.", 400);
  }

  if (product.changed("createdBy" as keyof Model<any, any>)) {
    throw new AppError("createdBy cannot be updated.", 400);
  }
});

export default Product;
