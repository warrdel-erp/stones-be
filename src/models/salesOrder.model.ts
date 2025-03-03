import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user";
import Customer from "./customer";
import Location from "./location";
import Tax from "./tax";
import PrintedNote from "./printedNote";
import InternalNote from "./internalNote";

const SalesOrder = sequelize.define(
  "SalesOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    soDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    customerPo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    specialInstruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending", // Example: pending, confirmed, shipped, completed, canceled
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true, // Soft delete
    },
    taxId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Tax,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Customer,
        key: "id",
      },
    },
    printedNoteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PrintedNote,
        key: "id",
      },
    },
    internalNoteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InternalNote,
        key: "id",
      },
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Location,
        key: "id",
      },
    },
  },
  {
    tableName: "sales_orders",
    timestamps: true,
    paranoid: true, // Enables soft delete
  }
);

// Associations
SalesOrder.belongsTo(User, { foreignKey: "userId", as: "user" });
SalesOrder.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
SalesOrder.belongsTo(Location, { foreignKey: "locationId", as: "location" });
SalesOrder.belongsTo(Tax, { foreignKey: "taxId", as: "taxDetails" });
SalesOrder.belongsTo(PrintedNote, { foreignKey: "printedNoteId", as: "printedNote" });
SalesOrder.belongsTo(InternalNote, { foreignKey: "internalNoteId", as: "internalNote" });

export default SalesOrder;
