import Delivery from "../models/Delivery.model";
import InvoiceDelivery from "../models/InvoiceDelivery.model";
import { Op, Transaction } from "sequelize";
import { DELIVERY_STATUS } from "../constants/tableTypes";

export const findPendingDeliveryByTruck = async (truckId: number) => {
    return Delivery.findOne({
        where: { truckId, status: DELIVERY_STATUS.PENDING }
    });
};

export const findInvoiceDeliveriesByLoadingOrderIds = async (loadingOrderIds: number[]) => {
    return InvoiceDelivery.findAll({
        where: {
            loadingOrderId: { [Op.in]: loadingOrderIds }
        }
    });
};

export const createDelivery = async (truckId: number, clientId: number, transaction: Transaction) => {
    return Delivery.create({ truckId, clientId, status: DELIVERY_STATUS.PENDING }, { transaction });
};

export const createInvoiceDelivery = async (
    data: {
        fromLat: number,
        fromLng: number,
        fromAddress: string,
        toLat: number,
        toLng: number,
        toAddress: string,
        loadingOrderId: number,
        deliveryId: number
    },
    transaction: Transaction
) => {
    return InvoiceDelivery.create(data, { transaction });
};

export const getAllDeliveriesByClientId = async (filter: any, clientId: number) => {
    return Delivery.findAll({
        where: { clientId, ...filter },
        order: [["createdAt", "DESC"]],
        include: [
            {
                association: "invoiceDeliveries",
                include: [
                    {
                        association: "loadingOrder"
                    }
                ]
            },
            {
                association: 'truck'
            }
        ],
    });
};

export const updateInvoiceDeliveryOrders = async (orders: Array<{ id: number, order: number }>, transaction?: Transaction) => {
    const updates = orders.map(({ id, order }) =>
        InvoiceDelivery.update({ order }, {
            where: { id },
            transaction
        })
    );

    return Promise.all(updates);
};

export const findInvoiceDeliveriesByIds = async (ids: number[]) => {
    return InvoiceDelivery.findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ['id', 'deliveryId']
    });
};

export const updateDeliveryStatus = async (deliveryIds: number[], status: string, transaction?: Transaction) => {
    return Delivery.update(
        { status },
        {
            where: { id: { [Op.in]: deliveryIds } },
            transaction
        }
    );
};

export const findDeliveryById = async (deliveryId: number, clientId?: number) => {
    const where: any = { id: deliveryId };
    if (clientId) {
        where.clientId = clientId;
    }
    return Delivery.findOne({
        where,
        include: [
            {
                association: "invoiceDeliveries",
                include: [
                    {
                        association: "loadingOrder"
                    }
                ]
            },
            {
                association: 'truck'
            }
        ],
    });
}; 
