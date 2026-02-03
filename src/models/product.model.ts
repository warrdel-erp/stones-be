import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { CustomUpdateOptions } from "../types/custom";
import ProductBaseColor from "./productBaseColor.model";
import ProductGroup from "./productGroup.model";
import ProductSubCategory from "./productSubCategory";
import User from "./user.model";
import Bin from "./bin.model";
import ProductFinish from "./productFinish.model";
import LedgerAccount from "./ledgerAccount.model";
import Client from "./client.model";
import { PRODUCT_KIND, UNITS_OF_MEASUREMENT } from "../constants";
import { COUNTRIES } from "../constants/countries";

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
    inventoryLinkAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LedgerAccount,
        key: "id",
      },
    },
    incomeAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LedgerAccount,
        key: "id",
      },
    },
    costOfGoodsAccountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LedgerAccount,
        key: "id",
      },
    },
    baseColorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ProductBaseColor,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ProductGroup,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    originId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    origin: {
      type: DataTypes.VIRTUAL,
      get() {
        return COUNTRIES.find((e) => e.id === this.get("originId"));
      },
    },
    uomId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uom: {
      type: DataTypes.VIRTUAL,
      get() {
        return UNITS_OF_MEASUREMENT.find((e) => e.id === this.get("uomId"));
      },
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    finishId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ProductFinish,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    kindId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    kind: {
      type: DataTypes.VIRTUAL,
      get() {
        return PRODUCT_KIND.find((e) => e.id === this.get("kindId"));
      },
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
    isSlabType: {
      type: DataTypes.BOOLEAN,
    },
    singleUnitPrice: {
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
    subCategoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: ProductSubCategory,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
    tableName: "products",
    timestamps: true,
    paranoid: true, // Enables soft delete functionality
    indexes: [
      {
        unique: true,
        fields: ["name", "clientId"],
        name: "unique_product_name_per_client",
      },
    ],
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

// Scope configuration for Product model
(Product as any).scopeConfig = {
  client: true,
  location: false,
};

export default Product;
