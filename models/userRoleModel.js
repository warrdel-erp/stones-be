import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from "sequelize";
export default sequelize.define('UserRole', {

  userRoleId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'user_role_id',
  },
  userEmail: {
    type: DataTypes.STRING,
    field: 'user_email',
    references: {
      model: 'users',
      key: 'email'
    },
    allowNull: false,
  },
  userId:{
    type: DataTypes.NUMBER,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    allowNull: true,
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
