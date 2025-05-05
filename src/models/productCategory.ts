import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Client from "./client.model";

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
      unique: {
        name: "unique_name_no_constraint",
        msg: "unique name_no",
      },
    },
    isSlabType: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }
  },
  {
    tableName: "product_category",
    timestamps: false,
  }
);

export default ProductCategory;
