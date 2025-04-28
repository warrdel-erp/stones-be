import * as models from "../models";

export const create = async (data: any) => {
    return await models.ProductBaseColor.create(data);
};

export const findAll = async (clientId: number) => {
    return await models.ProductBaseColor.findAll({
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

export const findById = async (id: number, clientId: number) => {
    return await models.ProductBaseColor.findByPk(id, {
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

export const update = async (id: number, data: any) => {
    const baseColor = await models.ProductBaseColor.findByPk(id);
    if (!baseColor) return null;
    return await baseColor.update(data);
};

export const remove = async (id: number, clientId: number) => {
    const baseColor = await findById(id, clientId);
    if (!baseColor) return false;
    await baseColor.destroy();
    return true;
};