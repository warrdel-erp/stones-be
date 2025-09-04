import { UNITS_OF_MEASUREMENT } from "../constants";
import * as serviceRepository from "../repositories/service.repository";

export const create = async (data: any) => {
    return await serviceRepository.createService(data);
};

export const getAll = async (clientId: number) => {
    const data = await serviceRepository.getAllServices(clientId);

    const finalData = data.map(e => {
        const plainData = e.get({ plain: true })
        plainData.uom = UNITS_OF_MEASUREMENT.find(k => k.id == plainData.uom);
        return plainData
    })

    return finalData
};

export const getOne = async (id: number, clientId: number) => {
    let data: any = await serviceRepository.getServiceById(id, clientId);
    data = data?.get({ plain: true });

    data.uom = UNITS_OF_MEASUREMENT.find((e) => e.id == data.uom);

    return data
};

export const update = async (id: number, data: any) => {
    return await serviceRepository.updateService(id, data);
};

export const remove = async (id: number, clientId: number) => {
    return await serviceRepository.deleteService(id, clientId);
}; 