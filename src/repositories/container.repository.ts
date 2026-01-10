import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

// Create Container
export const createContainer = async (data: any, transaction?: Transaction) => {
  return await scoped(models.Container).create(data, { transaction });
};

// Get All Containers
export const getAllContainers = async () => {
  return await models.Container.findAll();
};

// Get Container By ID
export const getContainerById = async (id: number) => {
  return await models.Container.findByPk(id);
};

// Update Container
export const updateContainer = async (id: number, data: any) => {
  await models.Container.update(data, { where: { id }, individualHooks: true });
  return getContainerById(id);
};

// Delete Container
export const deleteContainer = async (id: number) => {
  return await models.Container.destroy({ where: { id } });
};

// Get Containers By SIPL ID
export const getContainersBySiplId = async (siplId: number) => {
  return await models.Container.findAll({
    where: { siplId },
    order: [["createdAt", "ASC"]],
  });
};
