import * as rolePermissionRepository from '../repository/rolePermissionRepository.js'

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

export async function createUserRole(info) {
    return await rolePermissionRepository.createUserRole(info)
}

export async function assignPermissinToRoles({ permissionId, roleId }) {
    console.log( permissionId, roleId,'permission_id, role_id');
    return await rolePermissionRepository.assignPermissinToRoles({ permissionId, roleId })
}

export async function getUserPermissions(userId) {
    try {
        const userRolePermission = await rolePermissionRepository.getUserPermissions(userId);
        return userRolePermission;
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
    };
};


