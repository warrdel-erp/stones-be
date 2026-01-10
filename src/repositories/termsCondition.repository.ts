import { Transaction, WhereOptions } from "sequelize";
import * as models from "../models";
import { type TermsCondition } from "../models/termsCondition.model";
import { scoped } from "../utils/scoped";

// Create terms condition.
export const createTermsCondition = async (data: TermsCondition, transaction?: Transaction) => {
  return await scoped(models.TermsCondition).create(data, { transaction });
};

// Get terms condition by filter.
export const getTermsConditionByFilter = async (filter: WhereOptions, transaction?: Transaction) => {
  return await models.TermsCondition.findOne({ where: filter, transaction });
};

// Get terms condition by ID.
export const getTermsConditionById = async (id: number) => {
  return await models.TermsCondition.findByPk(id);
};

// Update terms condition by ID.
export const updateTermsCondition = async (id: number, data: Partial<TermsCondition>, transaction?: Transaction) => {
  return await models.TermsCondition.update(data, { where: { id }, transaction, returning: true });
};


