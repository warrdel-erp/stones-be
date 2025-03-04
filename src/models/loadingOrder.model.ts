import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrder from "./salesOrder.model";

const LoadingOrder = sequelize.define(
  "LoadingOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    loDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    paymentTerms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    invoiced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "loading_orders",
    timestamps: true,
  }
);

// Hook to prevent updates if invoiced = true
LoadingOrder.beforeUpdate((loadingOrder, options) => {
  if (loadingOrder.dataValues.invoiced) {
    throw new Error("Cannot update Loading Order as it is already invoiced.");
  }
});

export default LoadingOrder;
