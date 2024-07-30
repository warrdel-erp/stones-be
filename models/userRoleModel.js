import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from "sequelize";
export default sequelize.define('UserRole', {

  userRoleId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'user_role_id',
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'roles',
      key: 'role_id'
    },
    field: 'role_id'
  }
}, {
  tableName: 'user_roles',
  timestamps: false
});
