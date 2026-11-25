import { Model } from "sequelize";
import { requestContext } from "./requestContext";
import { AppError } from "../helper/appError";

export interface ScopeConfig {
  client?: boolean;
  company?: boolean;
  location?: boolean;
}

export const buildScope = (model: Model<any, any>) => {
  const where: any = {};
  const config = (model as any).scopeConfig || {};
  const store = requestContext.getStore();

  if (config.client || config.company) {
    const tenantId = store?.companyId || store?.clientId;
    if (!tenantId) {
      throw new AppError(`Error in tenant scope ${(model as any).name}`, 400);
    }
    if ((model as any).rawAttributes?.companyId) {
      where.companyId = tenantId;
    } else {
      where.clientId = tenantId;
    }
  }

  if (config.location) {
    // If user has 'company' locationScope, they are allowed access across all company locations.
    // If user has 'location' scope, enforce filtering by their active locationId.
    if (store?.locationScope !== "company") {
      if (!store?.locationId) {
        throw new AppError("Error in location scope", 400);
      }
      where.locationId = store.locationId;
    }
  }

  return where;
};

export const scoped = (model: any) => {
  const baseWhere = buildScope(model);

  return {
    findAll: (options: any = {}) =>
      model.findAll({
        ...options,
        where: { ...baseWhere, ...options.where },
      }),

    findOne: (options: any = {}) =>
      model.findOne({
        ...options,
        where: { ...baseWhere, ...options.where },
      }),

    findByPk: (id: number | string, options: any = {}) =>
      model.findOne({
        ...options,
        where: { ...baseWhere, ...options.where, id },
      }),

    findAndCountAll: (options: any = {}) =>
      model.findAndCountAll({
        ...options,
        where: { ...baseWhere, ...options.where },
      }),

    update: (data: any, options: any = {}) =>
      model.update(data, {
        ...options,
        where: { ...baseWhere, ...options.where },
      }),

    delete: (options: any = {}) =>
      model.destroy({
        ...options,
        where: { ...baseWhere, ...options.where },
      }),

    count: (options: any = {}) =>
      model.count({
        ...options,
        where: { ...baseWhere, ...options.where },
      }),

    destroy: (options: any = {}) =>
      model.destroy({
        ...options,
        where: { ...baseWhere, ...options.where },
      }),

    create: (data: any, options: any = {}) =>
      model.create(
        {
          ...data,
          ...(baseWhere || {}),
        },
        options
      ),

    bulkCreate: (rows: any[], options = {}) =>
      model.bulkCreate(
        rows.map((row) => ({
          ...row,
          ...(baseWhere || {}),
        })),
        {
          validate: true,
          ...options,
        }
      ),
  };
};
