import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const OpportunityQuotationInventoryProduct = sequelize.define(
  "OpportunityQuotationInventoryProduct",
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
    quotationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sellingRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    priceSource: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Standard",
    },
  },
  {
    tableName: "opportunity_quotation_inventory_products",
    timestamps: true,
  }
);

export default OpportunityQuotationInventoryProduct;
