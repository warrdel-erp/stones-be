import { sequelize } from "../config/database";
import * as accountPermissionRepository from "../repositories/accountPermission.repository";
import * as userRepository from "../repositories/user.repository";

// Get Permissions by Account ID (resolves permissions via user's assigned Role)
export const getPermissionsByAccountId = async (accountId: number) => {
  // 1. Check if user has an assigned Role with permissions
  const user: any = await userRepository.findUserByAccountId(accountId);
  if (user?.userRole?.permissions && user.userRole.permissions.length > 0) {
    return user.userRole.permissions.map((p: any) => p.permission);
  }

  // 2. Fallback for legacy accounts
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
    // Clear existing direct permissions
    await accountPermissionRepository.clearAccountPermissions(accountId, transaction);

    // Create new permissions (backward compatibility)
    if (permissions && permissions.length > 0) {
      const permissionData = permissions.map((perm) => ({
        accountId,
        permission: perm,
      }));
      await accountPermissionRepository.createAccountPermissions(permissionData, transaction);
    }

    await transaction.commit();
    return await getPermissionsByAccountId(accountId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
