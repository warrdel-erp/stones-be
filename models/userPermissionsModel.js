import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from "sequelize";
export default sequelize.define('UserPermissions', {

    userPermissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'user_permission_id',
    },
    userId: {
        type: DataTypes.NUMBER,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        allowNull: true,
    },
    permissionId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'permissions',
            key: 'permission_id'
        },
        field: 'permission_id'
    }
}, {
    tableName: 'user_permissions',
    timestamps: false
});
