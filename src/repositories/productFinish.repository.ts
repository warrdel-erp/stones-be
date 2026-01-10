import * as models from "../models";
import { scoped } from "../utils/scoped";

export const create = async (data: any) => {
    return await scoped(models.ProductFinish).create(data);
};

export const findAll = async (clientId: number) => {
    return await models.ProductFinish.findAll({
        include: [
            {
                model: models.User,
                as: "creator",
                attributes: [],
                where: {
                    clientId
                },
                required: true
            }
        ]
    });
};

export const findById = async (id: string, clientId: number) => {
    return await models.ProductFinish.findByPk(id, {
        include: [
            {
                model: models.User,
                as: "creator",
                attributes: [],
                where: { clientId },
                required: true
            }
        ]
    });
};

export const update = async (id: string, data: any) => {
    const finish = await models.ProductFinish.findByPk(id);
    if (!finish) return null;
    return await finish.update({ ...data });
};

export const removeById = async (id: string, clientId: number) => {
    const finish = await findById(id, clientId);
    if (!finish) return false;
    await finish.destroy();
    return true;
};