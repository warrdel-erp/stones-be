import TradeService from "../models/tradeService.model";
import { Op, Transaction } from "sequelize";
import { scoped } from "../utils/scoped";

export async function createTradeService(data: any, transaction?: Transaction) {
    return scoped(TradeService).create(data, { transaction });
}

export async function findTradeServices(filters: any = {}) {
    return scoped(TradeService).findAll({
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
    return scoped(TradeService).destroy({ where: { id } });
}

export async function updateTradeService(id: number, data: any, transaction?: Transaction) {
    const [affectedRows] = await scoped(TradeService).update(data, {
        where: { id },
        transaction,
    });
    if (affectedRows === 0) {
        return null;
    }
    return TradeService.findByPk(id, { transaction });
}

export async function getTradeServiceById(id: number, transaction?: Transaction) {
    return TradeService.findByPk(id, {
        transaction,
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