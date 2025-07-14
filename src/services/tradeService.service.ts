import { UNITS_OF_MEASUREMENT } from "../constants";
import * as tradeServiceRepository from "../repositories/tradeService.repository";

export async function createTradeService(data: any) {
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