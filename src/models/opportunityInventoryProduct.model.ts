import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const OpportunityInventoryProduct = sequelize.define(
  "OpportunityInventoryProduct",
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
    requirementProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "RESERVED",
    },
  },
  {
    tableName: "opportunity_inventory_products",
    timestamps: true,
  }
);

export default OpportunityInventoryProduct;
