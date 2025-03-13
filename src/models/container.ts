import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const Container = sequelize.define(
  "Container",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referenceType: {
      type: DataTypes.ENUM("sipl", "purchase_order"),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "containers",
    timestamps: true,
  }
);

// Hook to prevent updating referenceId, referenceType
Container.beforeUpdate((container: any) => {
  delete container.dataValues.referenceId;
  delete container.dataValues.referenceType;
});

export default Container;
