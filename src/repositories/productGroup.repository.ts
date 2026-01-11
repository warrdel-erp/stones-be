import * as models from "../models";
import ProductGroup from "../models/productGroup.model";
import { scoped } from "../utils/scoped";

export const create = async (data: any) => {
    return await scoped(ProductGroup).create(data);
};

export const findAll = async (clientId: number) => {
    return await scoped(ProductGroup).findAll({
        include: [
            {
                model: models.User,
                as: "createdByUser",
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
    return await ProductGroup.findByPk(id, {
        include: [
            {
                model: models.User,
                as: "createdByUser",
                attributes: [],
                where: { clientId },
                required: true
            }
        ]
    });
};

export const update = async (id: string, data: any) => {
    const group = await ProductGroup.findByPk(id);
    if (!group) return null;
    return await group.update({ ...data });
};

export const removeById = async (id: string, clientId: number) => {
    const group = await findById(id, clientId);
    if (!group) return false;
    await group.destroy();
    return true;
};