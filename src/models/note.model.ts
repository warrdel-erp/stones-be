import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { NOTES_REFERENCE_TYPES, NOTES_TYPE } from "../constants/tableTypes";

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
      type: DataTypes.ENUM(...Object.values(NOTES_TYPE)),
      allowNull: false,
    },
    referenceType: {
      type: DataTypes.ENUM(...Object.values(NOTES_REFERENCE_TYPES)),
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
