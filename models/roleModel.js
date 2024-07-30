import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';

export default sequelize.define('roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'role_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'role_name',

  },
  roleDescription:{
    type: DataTypes.STRING,
    allowNull:false,
    field:'role_description'
  }
}, {
  tableName: 'roles',
  timestamps: false
});
