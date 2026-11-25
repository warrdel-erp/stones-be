import { Op, Transaction } from "sequelize";
import * as models from "../models";

export const getAllRoles = async (clientId?: number) => {
  const whereClause: any = clientId
    ? {
        [Op.or]: [{ clientId: null }, { clientId }],
      }
    : {};

  return await models.Role.findAll({
    where: whereClause,
    include: [
      {
        model: models.RolePermission,
        as: "permissions",
        attributes: ["permission"],
      },
    ],
    order: [
      ["isSystem", "DESC"],
      ["name", "ASC"],
    ],
  });
};

export const getRoleById = async (id: number) => {
  return await models.Role.findByPk(id, {
    include: [
      {
        model: models.RolePermission,
        as: "permissions",
        attributes: ["permission"],
      },
    ],
  });
};

export const getRoleByName = async (name: string, clientId?: number) => {
  const whereClause: any = { name };
  if (clientId) {
    whereClause[Op.or] = [{ clientId: null }, { clientId }];
  }
  return await models.Role.findOne({ where: whereClause });
};

export const createRole = async (
  data: {
    name: string;
    description?: string;
    isSystem?: boolean;
    systemRoleKey?: string;
    clientId?: number;
  },
  transaction?: Transaction
) => {
  return await models.Role.create(data, { transaction });
};

export const updateRole = async (
  id: number,
  data: { name?: string; description?: string },
  transaction?: Transaction
) => {
  await models.Role.update(data, {
    where: { id },
    transaction,
  });
  return await getRoleById(id);
};

export const deleteRole = async (id: number, transaction?: Transaction) => {
  return await models.Role.destroy({
    where: { id },
    transaction,
  });
};

export const setRolePermissions = async (
  roleId: number,
  permissions: string[],
  transaction?: Transaction
) => {
  await models.RolePermission.destroy({
    where: { roleId },
    transaction,
  });

  if (permissions && permissions.length > 0) {
    const rows = permissions.map((permission) => ({
      roleId,
      permission,
    }));
    await models.RolePermission.bulkCreate(rows, { transaction });
  }
};

export const countUsersByRoleId = async (roleId: number) => {
  return await models.User.count({
    where: { roleId },
  });
};
