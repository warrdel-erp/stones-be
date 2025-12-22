import { sequelize } from "../config/database";
import * as accountPermissionRepository from "../repositories/accountPermission.repository";
import { AppError } from "../helper/appError";

// Get Permissions by Account ID
export const getPermissionsByAccountId = async (accountId: number) => {
    const permissions = await accountPermissionRepository.getAccountPermissions(accountId);
    return permissions.map((p: any) => p.permission);
};

// Update Account Permissions by Account ID
export const updateAccountPermissions = async (
    accountId: number,
    permissions: string[]
) => {
    const transaction = await sequelize.transaction();
    try {
        // Clear existing permissions
        await accountPermissionRepository.clearAccountPermissions(accountId, transaction);

        // Create new permissions
        if (permissions && permissions.length > 0) {
            const permissionData = permissions.map((perm) => ({
                accountId,
                permission: perm,
            }));
            await accountPermissionRepository.createAccountPermissions(permissionData, transaction);
        }

        await transaction.commit();

        // Return updated permissions
        const updatedPermissions = await accountPermissionRepository.getAccountPermissions(accountId);
        return updatedPermissions.map((p: any) => p.permission);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
