import { Model } from "sequelize";
import { requestContext } from "./requestContext";
import { AppError } from "../helper/appError";

export interface ScopeConfig {
  client?: boolean;
  location?: boolean;
}

export const buildScope = (model: any) => {
  const where: any = {};
  const config = model.scopeConfig || {};
  const store = requestContext.getStore();

  if (config.client) {
    if (!store?.clientId) {
      throw new AppError('Error in client scope', 400);
    }
    where.clientId = store.clientId;
  }

  if (config.location) {
    if (!store?.locationId) {
      throw new AppError('Error in client scope', 400);
    }
    where.locationId = store.locationId;
  }

  return where;
};

export const scoped = (model: any) => {
  const baseWhere = buildScope(model);

  return {
    findAll: (options: any = {}) =>
      model.findAll({
        ...options,
        where: { ...baseWhere, ...options.where }
      }),

    findOne: (options: any = {}) =>
      model.findOne({
        ...options,
        where: { ...baseWhere, ...options.where }
      }),

    findByPk: (id: number | string, options: any = {}) =>
      model.findOne({
        ...options,
        where: { ...baseWhere, ...options.where, id }
      }),

    findAndCountAll: (options: any = {}) =>
      model.findAndCountAll({
        ...options,
        where: { ...baseWhere, ...options.where }
      }),

    update: (data: any, options: any = {}) =>
      model.update(data, {
        ...options,
        where: { ...baseWhere, ...options.where }
      }),

    delete: (options: any = {}) =>
      model.destroy({
        ...options,
        where: { ...baseWhere, ...options.where }
      }),

    destroy: (options: any = {}) =>
      model.destroy({
        ...options,
        where: { ...baseWhere, ...options.where }
      }),

    create: (data: any, options: any = {}) =>
      model.create({
        ...data,
        ...(baseWhere || {})
      }, options),

    bulkCreate: (rows: any[], options = {}) =>
      model.bulkCreate(
        rows.map(row => ({
          ...row,
          ...(baseWhere || {})
        })),
        {
          validate: true,
          ...options
        }
      )
  };
};
