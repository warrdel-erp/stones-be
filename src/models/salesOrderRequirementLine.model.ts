import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const SalesOrderRequirementLine = sequelize.define(
  "SalesOrderRequirementLine",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    salesOrderId: { type: DataTypes.INTEGER, allowNull: false, field: "sales_order_id" },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: "product_id" },
    unitType: { type: DataTypes.STRING, allowNull: false, defaultValue: "slabs", field: "unit_type" },
    requiredCount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "required_count" },
    allocatedCount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0, field: "allocated_count" },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "unit_price" },
    taxApplied: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "tax_applied" },
    minLength: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "min_length" },
    minWidth: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: "min_width" },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "PENDING" },
    clientId: { type: DataTypes.INTEGER, allowNull: false, field: "client_id" },
    locationId: { type: DataTypes.INTEGER, allowNull: false, field: "location_id" },
  },
  {
    tableName: "sales_order_requirement_lines",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

(SalesOrderRequirementLine as any).scopeConfig = { client: true, location: true };

export default SalesOrderRequirementLine;
