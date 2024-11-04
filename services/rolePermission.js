import * as rolePermissionRepository from '../repository/rolePermissionRepository.js'
import { findUserData } from '../repository/userRepository.js';
import sequelize from '../database/sequelizeConfig.js';

export async function createRole(info) {
    return await rolePermissionRepository.createRole(info)
}

export async function getAllRoles(search) {
    try {
        const rolesList = await rolePermissionRepository.getAllRoles(search);
        return rolesList;
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
    };
};

export async function getRolesWithUser() {
    try {
        const rolesList = await rolePermissionRepository.getRolesWithUser();
        return rolesList;
    } catch (error) {
        console.error('Error fetching roles with users:', error);
        throw error;
    }
}

export async function createPermission(info) {
    return await rolePermissionRepository.createPermission(info)
}


export async function getAllPermissionList() {
    try {
        const permissionList = await rolePermissionRepository.getAllPermissionList();
        return permissionList;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        throw error;
    }
}

export async function createUserRole(info) {
    console.log(info, 'infor');


    if (!Array.isArray(info)) {
        info = [info];
    }

    const transaction = await sequelize.transaction();
    try {

        for (const userRole of info) {
            await rolePermissionRepository.createUserRole(userRole, { transaction });
        }
        await transaction.commit();
        return {
            success: true,
            message: "All user-role assignments have been successfully created.",
        };
    } catch (error) {
        await transaction.rollback();
        return {
            success: false,
            message: "Failed to create user-role assignments.",
            error: error.message || error,
        };
    }
}
export async function assignPermissinToRoles(info) {
    const transaction = await sequelize.transaction();
    try {
        if (!info || !info.permissions) {
            throw new Error("Invalid input: 'permissions' array is required.");
        }

        const { permissions } = info;
        if (!Array.isArray(permissions)) {
            throw new Error("'permissions' should be an array.");
        }

        for (const { permissionId, roleId } of permissions) {
            await rolePermissionRepository.assignPermissinToRoles(
                { permissionId, roleId },
                { transaction }
            );
        }

        await transaction.commit();
        return {
            success: true,
            message: "All permissions have been successfully assigned to roles.",
        };
    } catch (error) {
        await transaction.rollback();
        return {
            success: false,
            message: "Failed to assign permissions to roles.",
            error: error.message || error,
        };
    }
}


export async function getUserPermissions(userId) {
    try {
        const userData = await findUserData(userId);
        const userEmail = userData.dataValues.email;
        const userRolePermission = await rolePermissionRepository.getUserPermissions(userEmail);
        console.log(userRolePermission, 'uerek');

        return userRolePermission;
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
    };
};

export async function assignPermissionsToUser(info) {
    const transaction = await sequelize.transaction();
    try {
        // Ensure that `info` is an array
        if (!Array.isArray(info)) {
            throw new Error("Input data should be an array of { userId, permissionId } objects.");
        }

        const userPermissions = [];

        // Loop through each { userId, permissionId } pair and assign it
        for (const { userId, permissionId } of info) {
            const userPermission = await rolePermissionRepository.assignPermissionsToUser(
                { userId, permissionId },
                { transaction }
            );
            userPermissions.push(userPermission);
        }

        await transaction.commit();
        return {
            success: true,
            message: "Permissions have been successfully assigned to users.",
            data: userPermissions,
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error in assignPermissionsToUser:', error);
        throw {
            success: false,
            message: "Failed to assign permissions to users.",
            error: error.message || error,
        };
    }
}



export async function rolesPermissions(rolesId) {
    return await rolePermissionRepository.rolesPermissions(rolesId)
}



export async function rolesPermissionUpdate(info) {
    const transaction = await sequelize.transaction();
    try {
        for (const item of info) {
            await rolePermissionRepository.rolesPermissionUpdate(item, { transaction });
        }
        await transaction.commit();
        return { success: true, message: 'Permissions updated successfully' };
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating permissions:', error);
        return { success: false, message: 'Error updating permissions', error };
    }
}