import * as models from "../models";

export const createService = async (payload: any) => {
    return await models.Service.create(payload);
};

export const getAllServices = async (clientId: number) => {
    return await models.Service.findAll({
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
    return await models.Service.findOne({
        where: { id },
        include: [
            { association: "serviceCategory", where: { clientId } },
            { association: "ledgerAccount" }
        ]
    });
};

export const updateService = async (id: number, data: any) => {
    return await models.Service.update(data, { where: { id } });
};

export const deleteService = async (id: number, clientId: number) => {
    // Only allow delete if the service belongs to the client's category
    const service = await models.Service.findOne({
        where: { id },
        include: [{ association: "serviceCategory", where: { clientId } }]
    });
    if (!service) return 0;
    return await models.Service.destroy({ where: { id } });
}; 