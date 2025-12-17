import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import SIPL from "./sipl.model";
import Client from "./client.model";

const Container = sequelize.define(
  "Container",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    siplId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SIPL,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Client,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "containers",
    timestamps: true,
  }
);

// Hook to prevent updating siplId and clientId
Container.beforeUpdate((container: any) => {
  delete container.dataValues.siplId;
  delete container.dataValues.clientId;
});

export default Container;
