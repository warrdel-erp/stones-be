import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as roleRepository from "../repositories/role.repository";

export const listRoles = async (clientId?: number) => {
  const roles = await roleRepository.getAllRoles(clientId);
  return roles.map((role: any) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    systemRoleKey: role.systemRoleKey,
    clientId: role.clientId,
    permissions: role.permissions?.map((p: any) => p.permission) || [],
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));
};

export const getRole = async (id: number) => {
  const role: any = await roleRepository.getRoleById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    systemRoleKey: role.systemRoleKey,
    clientId: role.clientId,
    permissions: role.permissions?.map((p: any) => p.permission) || [],
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
};

export const createRole = async (
  data: {
    name: string;
    description?: string;
    permissions?: string[];
  },
  clientId?: number
) => {
  const existingRole = await roleRepository.getRoleByName(data.name, clientId);
  if (existingRole) {
    throw new AppError("A role with this name already exists", 400);
  }

  const transaction = await sequelize.transaction();
  try {
    const role: any = await roleRepository.createRole(
      {
        name: data.name,
        description: data.description,
        isSystem: false,
        clientId,
      },
      transaction
    );

    if (data.permissions && data.permissions.length > 0) {
      await roleRepository.setRolePermissions(
        role.id,
        data.permissions,
        transaction
      );
    }

    await transaction.commit();
    return await getRole(role.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateRole = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    permissions?: string[];
  }
) => {
  const role: any = await roleRepository.getRoleById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (role.isSystem) {
    throw new AppError("System roles cannot be modified", 403);
  }

  const transaction = await sequelize.transaction();
  try {
    await roleRepository.updateRole(
      id,
      {
        name: data.name,
        description: data.description,
      },
      transaction
    );

    if (Array.isArray(data.permissions)) {
      await roleRepository.setRolePermissions(
        id,
        data.permissions,
        transaction
      );
    }

    await transaction.commit();
    return await getRole(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteRole = async (id: number) => {
  const role: any = await roleRepository.getRoleById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (role.isSystem) {
    throw new AppError("System roles cannot be deleted", 403);
  }

  const userCount = await roleRepository.countUsersByRoleId(id);
  if (userCount > 0) {
    throw new AppError(
      `Cannot delete role because it is currently assigned to ${userCount} user(s)`,
      400
    );
  }

  const transaction = await sequelize.transaction();
  try {
    await roleRepository.setRolePermissions(id, [], transaction);
    await roleRepository.deleteRole(id, transaction);
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
