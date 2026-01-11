import { AppError } from "../helper/appError";
import * as serviceRepository from "../repositories/service.repository";

export const create = async (data: any) => {
    return await serviceRepository.createService(data);
};

export const getAll = async (clientId: number) => {
    const data = await serviceRepository.getAllServices(clientId);

    return data
};

export const getOne = async (id: number, clientId: number) => {
    let data: any = await serviceRepository.getServiceById(id, clientId);
    return data
};

export const update = async (id: number, data: any) => {
    return await serviceRepository.updateService(id, data);
};

export const remove = async (id: number, clientId: number) => {
    return await serviceRepository.deleteService(id, clientId);
};

type ServiceCategoryType = "purchase" | "sale";
type ServiceIdentifier = { serviceId?: number } | number;

const extractServiceIds = (services: ServiceIdentifier[]) => {
    return Array.from(
        new Set(
            services
                .map((service) => {
                    if (typeof service === "number") return service;
                    return service?.serviceId;
                })
                .filter((id): id is number => typeof id === "number")
        )
    );
};

export const ensureServicesBelongToCategory = async (
    services: ServiceIdentifier[],
    clientId?: number,
    expectedType: ServiceCategoryType = "sale"
) => {
    if (!clientId) {
        throw new AppError("Client context is required to validate services.", 400);
    }

    const serviceIds = extractServiceIds(services);

    if (!serviceIds.length) {
        throw new AppError("Each service entry must include a valid serviceId.", 400);
    }

    const dbServices = await serviceRepository.getServicesByIds(serviceIds, clientId);

    if (dbServices.length !== serviceIds.length) {
        throw new AppError("One or more services are invalid for this client.", 400);
    }

    const invalidService = dbServices
        .map((service: any) => service.get({ plain: true }) as { name: string; serviceCategory?: { type?: ServiceCategoryType } })
        .find((service: any) => service.serviceCategory?.type !== expectedType);

    if (invalidService) {
        throw new AppError(`Service ${invalidService.name} is not part of a ${expectedType} service category.`, 400);
    }
};