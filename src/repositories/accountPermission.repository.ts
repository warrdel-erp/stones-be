import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

// Get permissions by Account ID
export const getAccountPermissions = async (accountId: number) => {
    return await scoped(models.AccountPermission).findAll({
        where: { accountId },
        attributes: ["permission"],
    });
};

// Bulk Create Permissions
export const createAccountPermissions = async (
    permissions: { accountId: number; permission: string }[],
    transaction?: Transaction
) => {
    return await scoped(models.AccountPermission).bulkCreate(permissions as any, { transaction });
};

// Delete All Permissions for Account
export const clearAccountPermissions = async (
    accountId: number,
    transaction?: Transaction
) => {
    return await scoped(models.AccountPermission).destroy({
        where: { accountId },
        transaction,
    });
};
