import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const Opportunity = sequelize.define(
  "Opportunity",
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
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endCustomerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    opportunityName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    opportunityType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "New Requirement",
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Normal",
    },
    expectedDecisionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    leadSource: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "WhatsApp",
    },

    salespersonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referralBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpAction: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "OPEN",
    },
    taxRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
  },
  {
    tableName: "opportunities",
    timestamps: true,
  }
);

export default Opportunity;
