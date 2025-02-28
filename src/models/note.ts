import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const Notes = sequelize.define(
  "Notes",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("internal", "printable"),
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "notes",
    timestamps: true,
  }
);

export default Notes;
