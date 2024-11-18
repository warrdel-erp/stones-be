import sequelize from "../database/sequelizeConfig.js";
import { DataTypes } from "sequelize";

export default sequelize.define(
  "product_landed_cost",
  {
    productLandedCostId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "product_landed_cost_id",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "products", 
        key: "product_id", 
      },
      onDelete: "SET NULL",
      field: "product_id",
    },
    productLandedCost: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "product_landed_cost",
    },
    poSupplierInvoiceMapperId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "po_supplier_invoice_mapper",
        key: "po_supplier_invoice_mapper_id", 
      },
      onDelete: "SET NULL",
      field: "po_supplier_invoice_mapper_id",
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "created_by",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      onUpdate: sequelize.literal("CURRENT_TIMESTAMP"),
      field: "updated_at",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "deleted_at",
    },
  },
  {
    tableName: "product_landed_cost",
    timestamps: true,
    paranoid: true,
  }
);
