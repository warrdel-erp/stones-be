import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createService = async (payload: any) => {
    return await scoped(models.Service).create(payload);
};

export const getAllServices = async (clientId: number) => {
    return await scoped(models.Service).findAll({
        include: [
            {
                association: "serviceCategory",
                where: { clientId },
                required: true
            },
            { association: "ledgerAccount" }
        ]
    });
};

export const getServiceById = async (id: number, clientId: number) => {
    return await scoped(models.Service).findOne({
        where: { id },
        include: [
            { association: "serviceCategory", where: { clientId } },
            { association: "ledgerAccount" }
        ]
    });
};

export const updateService = async (id: number, data: any) => {
    return await scoped(models.Service).update(data, { where: { id } });
};

export const deleteService = async (id: number, clientId: number) => {
    // Only allow delete if the service belongs to the client's category
    const service = await scoped(models.Service).findOne({
        where: { id },
        include: [{ association: "serviceCategory", where: { clientId } }]
    });
    if (!service) return 0;
    return await scoped(models.Service).destroy({ where: { id } });
};

export const getServiceOptions = async (clientId: number, type?: "purchase" | "sale") => {
    return scoped(models.Service).findAll({
        attributes: [
            ["name", "label"],
            ["id", "value"],

        ],
        include: [
            {
                association: "serviceCategory",
                attributes: [],
                where: {
                    clientId,
                    ...(type ? { type } : {})
                },
                required: true
            }
        ],
        order: [["name", "ASC"]],
    });
};

export const getServicesByIds = async (serviceIds: number[], clientId: number) => {
    if (!serviceIds.length) {
        return [];
    }

    return scoped(models.Service).findAll({
        where: { id: serviceIds },
        attributes: ["id", "name", "serviceCategoryId"],
        include: [
            {
                association: "serviceCategory",
                attributes: ["id", "type", "clientId"],
                where: { clientId },
                required: true,
            },
        ],
    });
};