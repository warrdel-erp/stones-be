import { UNITS_OF_MEASUREMENT } from "../constants";
import * as tradeServiceRepository from "../repositories/tradeService.repository";
import { AppError } from "../helper/appError";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";
import { LOADING_ORDER_STAGES } from "../constants/tableTypes";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";

export async function createTradeService(data: any) {
    if (data.referenceType === TRADE_SERVICE_REFERENCE_TYPES.LOADING_ORDER) {
        const loadingOrderInstance = await loadingOrderRepository.getLoadingOrderByIdSimple(data.referenceId);

        const loadingOrder = loadingOrderInstance?.get({ plain: true });

        if (!loadingOrder) {
            throw new AppError("Loading Order not found", 404);
        }
        if (loadingOrder.stage === LOADING_ORDER_STAGES.INVOICED) {
            throw new AppError("Cannot create Trade Service for an invoiced Loading Order", 400);
        }
    }
    return tradeServiceRepository.createTradeService(data);
}

export async function listTradeServices(filters: any = {}) {
    const data = await tradeServiceRepository.findTradeServices(filters);

    const finalData = data.map(tradeService => {
        const plainData = tradeService.get({ plain: true })
        plainData.service.uom = UNITS_OF_MEASUREMENT.find(e => e.id == plainData.service.uom);
        return plainData
    })

    return finalData
}

export async function deleteTradeService(id: number) {
    return tradeServiceRepository.deleteTradeServiceById(id);
} 