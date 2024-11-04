import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from "sequelize";


export default sequelize.define('permissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'permission_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'permission_name'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'description'
  },
  module: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'module'
  },
  route: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'route'
  }
}, {
  tableName: 'permissions',
  timestamps: false
});



