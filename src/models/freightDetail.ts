import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SIPL from "./sipl.model";
import Vendor from "./vendor";
import PurchaseOrder from "./purchaseOrder";

const FreightDetail = sequelize.define(
  "FreightDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vessel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    airBill: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plannedExFactoryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    exFactoryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    departurePort: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    etdPort: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    arrivalPort: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    etaPort: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dischargePort: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wiringInstruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    freightForwarderId: {
      type: DataTypes.INTEGER,
      // allowNull: false,
      references: {
        model: Vendor,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    siplId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SIPL,
        key: "id",
      },
      onUpdate: "CASCADE",
    },
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PurchaseOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "freight_details",
    timestamps: true,
    paranoid: true,
  }
);

export default FreightDetail;
