import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

const ProductSubCategory = sequelize.define(
  "ProductSubCategory",
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
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: "id",
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    isSlabType: {
      type: DataTypes.BOOLEAN
    }
  },
  {
    tableName: "product_sub_categories",
    timestamps: true,
  }
);

export default ProductSubCategory;
