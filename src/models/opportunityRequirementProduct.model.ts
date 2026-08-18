import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const OpportunityRequirementProduct = sequelize.define(
  "OpportunityRequirementProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    opportunityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requiredCount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    allocatedCount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "opportunity_requirement_products",
    timestamps: true,
  }
);

export default OpportunityRequirementProduct;
