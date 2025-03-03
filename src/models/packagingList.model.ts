import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import LoadingOrder from "./loadingOrder.model";

const PackagingList = sequelize.define(
  "PackagingList",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    loadingOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: LoadingOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "packaging_lists",
    timestamps: true,
  }
);

export default PackagingList;
