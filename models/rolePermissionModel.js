import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from "sequelize";

export default sequelize.define('role_permissions', {
  
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'role_permission_id',
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'roles',
      key: 'id'
    },
    field:'role_id'
  },
  permissionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'permissions',
      key: 'id'
    },
    field:'permission_id'
  }
}, {
  tableName: 'role_permissions',
  timestamps: false
});