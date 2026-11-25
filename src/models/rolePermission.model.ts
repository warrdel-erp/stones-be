import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Role from "./role.model";

const RolePermission = sequelize.define(
  "RolePermission",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    permission: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "role_permissions",
    timestamps: true,
  }
);

(RolePermission as any).scopeConfig = {
  client: false,
  location: false,
};

export default RolePermission;
