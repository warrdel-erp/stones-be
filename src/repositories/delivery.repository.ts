import Delivery from "../models/Delivery.model";
import InvoiceDelivery from "../models/InvoiceDelivery.model";
import { Op, Transaction } from "sequelize";
import { DELIVERY_STATUS } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

export const findPendingDeliveryByTruck = async (truckId: number) => {
    return scoped(Delivery).findOne({
        where: { truckId, status: DELIVERY_STATUS.PENDING }
    });
};

export const findInvoiceDeliveriesByLoadingOrderIds = async (loadingOrderIds: number[]) => {
    return scoped(InvoiceDelivery).findAll({
        where: {
            loadingOrderId: { [Op.in]: loadingOrderIds }
        }
    });
};

export const createDelivery = async (truckId: number, clientId: number, transaction: Transaction) => {
    return scoped(Delivery).create({ truckId, clientId, status: DELIVERY_STATUS.PENDING }, { transaction });
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
    return scoped(InvoiceDelivery).create(data, { transaction });
};

export const getAllDeliveriesByClientId = async (filter: any, clientId: number) => {
    console.log("filterdata", filter);
    const filterStatus = { status: filter.filter }
    const limit = Number(filter.limit)
    const page = Number(filter.page)
    const offset = (page - 1) * limit;
    const { rows: data, count: total } = await scoped(Delivery).findAndCountAll({
        where: { clientId, ...filterStatus },
        order: [["createdAt", "DESC"]],
        include: [
            {
                association: "invoiceDeliveries",
                include: [
                    {
                        association: "loadingOrder"
                    }
                ],
                // order: [['order', 'asc']]
            },
            {
                association: 'truck'
            }
        ], limit, offset
    });
    console.log({ rows: data, count: total });

    return { data, paginationData: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const updateInvoiceDeliveryOrders = async (orders: Array<{ id: number, order: number }>, transaction?: Transaction) => {
    const updates = orders.map(({ id, order }) =>
        scoped(InvoiceDelivery).update({ order }, {
            where: { id },
            transaction
        })
    );

    return Promise.all(updates);
};

export const findInvoiceDeliveriesByIds = async (ids: number[]) => {
    return scoped(InvoiceDelivery).findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ['id', 'deliveryId']
    });
};

export const updateDeliveryStatus = async (deliveryIds: number[], status: string, transaction?: Transaction) => {
    return scoped(Delivery).update(
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
    return scoped(Delivery).findOne({
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
