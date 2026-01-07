import { UNITS_OF_MEASUREMENT } from "../constants";
import * as tradeServiceRepository from "../repositories/tradeService.repository";
import { AppError } from "../helper/appError";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";
import { LOADING_ORDER_STAGES } from "../constants/tableTypes";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import { Transaction } from "sequelize";
import { ensureServicesBelongToCategory } from "../services/service.service";
import { sumDecimal } from "../helper";
import * as returnRepository from "../repositories/return.repository";
import { RETURN_STATUS } from "../models/return.model";

export async function createTradeService(data: any, transaction?: Transaction) {
    if (data.referenceType === TRADE_SERVICE_REFERENCE_TYPES.LOADING_ORDER) {
        const loadingOrderInstance = await loadingOrderRepository.getLoadingOrderByIdSimple(data.referenceId, transaction);

        const loadingOrder = loadingOrderInstance?.get({ plain: true });

        if (!loadingOrder) {
            throw new AppError("Loading Order not found", 404);
        }
        if (loadingOrder.stage === LOADING_ORDER_STAGES.INVOICED) {
            throw new AppError("Cannot create Trade Service for an invoiced Loading Order", 400);
        }
    }

    if (data.referenceType === TRADE_SERVICE_REFERENCE_TYPES.RETURN) {
        const returnRecord = await returnRepository.getReturnById(data.referenceId, transaction);

        if (!returnRecord) {
            throw new AppError("Return not found", 404);
        }

        const returnData = returnRecord.get({ plain: true });

        if (returnData.status !== RETURN_STATUS.INITIATED) {
            throw new AppError("Cannot create Trade Service for a return that is not in initiated status", 400);
        }
    }

    return tradeServiceRepository.createTradeService(data, transaction);
}

export async function listTradeServices(filters: any = {}) {
    const data: any = await tradeServiceRepository.findTradeServices(filters);


    const serviceTotal = sumDecimal(data.map((e: any) => e.applyToCustomer ? -e.total : e.total));

    return { data, serviceTotal }
}

export async function deleteTradeService(id: number) {
    return tradeServiceRepository.deleteTradeServiceById(id);
}

export async function updateTradeService(id: number, data: any, transaction?: Transaction) {
    // Get existing trade service to check reference type
    const existingTradeService = await tradeServiceRepository.getTradeServiceById(id, transaction);

    if (!existingTradeService) {
        throw new AppError("Trade Service not found", 404);
    }

    const existingData = existingTradeService.get({ plain: true });
    const referenceType = existingData.referenceType;
    const referenceId = existingData.referenceId;

    // Validate based on reference type (similar to create)
    if (referenceType === TRADE_SERVICE_REFERENCE_TYPES.LOADING_ORDER) {
        const loadingOrderInstance = await loadingOrderRepository.getLoadingOrderByIdSimple(referenceId, transaction);
        const loadingOrder = loadingOrderInstance?.get({ plain: true });

        if (!loadingOrder) {
            throw new AppError("Loading Order not found", 404);
        }
        if (loadingOrder.stage === LOADING_ORDER_STAGES.INVOICED) {
            throw new AppError("Cannot update Trade Service for an invoiced Loading Order", 400);
        }
    }

    if (referenceType === TRADE_SERVICE_REFERENCE_TYPES.RETURN) {
        const returnRecord = await returnRepository.getReturnById(referenceId, transaction);

        if (!returnRecord) {
            throw new AppError("Return not found", 404);
        }

        const returnData = returnRecord.get({ plain: true });

        if (returnData.status !== RETURN_STATUS.INITIATED) {
            throw new AppError("Cannot update Trade Service for a return that is not in initiated status", 400);
        }
    }

    return tradeServiceRepository.updateTradeService(id, data, transaction);
}

export async function createMultipleTradeServices(
    services: any[],
    referenceType: string,
    referenceId: number,
    clientId: number,
    categoryType: "purchase" | "sale",
    transaction?: Transaction
) {
    if (!Array.isArray(services) || services.length === 0) {
        return [];
    }

    // Validate that all services belong to the specified category type
    await ensureServicesBelongToCategory(services, clientId, categoryType);

    const servicePayloads = services.map((service: any) => ({
        ...service,
        referenceType,
        referenceId,
        clientId,
    }));

    const promises: Promise<any>[] = [];
    for (const servicePayload of servicePayloads) {
        promises.push(createTradeService(servicePayload, transaction));
    }
    return await Promise.all(promises);
}
