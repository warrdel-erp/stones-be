import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SalesOrderInvoice from "./salesOrderInvoice.model";
import AdvancedDeposit from "./advancedDeposit.model";

const AdvancedDepositSettlement = sequelize.define(
  "AdvancedDepositSettlement",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    soInvoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrderInvoice,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    advancedDepositId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: AdvancedDeposit,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
  },
  {
    tableName: "advanced_deposit_settlements",
    timestamps: true,
  }
);

export default AdvancedDepositSettlement;

