import TradeService from "../models/tradeService.model";
import { Op } from "sequelize";

export async function createTradeService(data: any) {
    return TradeService.create(data);
}

export async function findTradeServices(filters: any = {}) {
    return TradeService.findAll({
        where: filters,
        include: [
            {
                association: 'service',
                include: [
                    {
                        association: 'serviceCategory'
                    }
                ]
            }
        ]
    });
}

export async function deleteTradeServiceById(id: number) {
    return TradeService.destroy({ where: { id } });
} 