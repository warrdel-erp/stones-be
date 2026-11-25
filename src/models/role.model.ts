import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    systemRoleKey: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);

(Role as any).scopeConfig = {
  client: false, // Roles include both global system roles (clientId: null) and tenant-specific roles
  location: false,
};

export default Role;
