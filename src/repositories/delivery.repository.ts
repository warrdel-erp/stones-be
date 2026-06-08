import Delivery from "../models/Delivery.model";
import InvoiceDelivery from "../models/InvoiceDelivery.model";
import Truck from "../models/truck.model";
import { Op, Transaction } from "sequelize";
import { DELIVERY_STATUS } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";
import { sequelize } from "../config/database";

export const findPendingDeliveryByTruck = async (truckId: number) => {
    return scoped(Delivery).findOne({
        where: { truckId, status: DELIVERY_STATUS.PENDING }
    });
};

export const checkTruckIsOccupied = async (truckId: number) => {
    return scoped(Delivery).findOne({
        where: { truckId, status: { [Op.in]: [DELIVERY_STATUS.APPROVED, DELIVERY_STATUS.STARTED, DELIVERY_STATUS.PENDING] } }
    });
};

export const findExistingInvoiceDeliveriesByPackagingListIds = async (packagingListIds: number[]) => {
    return scoped(InvoiceDelivery).findAll({
        where: {
            packagingListId: { [Op.in]: packagingListIds }
        },
        include: [
            {
                association: "delivery",
                where: { status: { [Op.ne]: DELIVERY_STATUS.REJECTED } }
            }
        ]
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
        packagingListId: number,
        deliveryId: number
    },
    transaction: Transaction
) => {
    return scoped(InvoiceDelivery).create(data, { transaction });
};

export const getAllDeliveriesByClientId = async (page: number, limit: number, clientId: number, filters?: any) => {

    const offset = (page - 1) * limit;

    return await scoped(Delivery).findAndCountAll({
        where: { clientId, ...filters },
        order: [["createdAt", "DESC"]],
        include: [
            {
                association: "invoiceDeliveries",
                include: [
                    {
                        association: "packagingList",
                        include: [{ association: "salesOrderProducts" }]
                    }
                ],
            },
            {
                association: 'truck',
                include: [{ association: 'driver', attributes: ['id', 'username', 'userid', 'role'] }]
            }
        ], limit, offset
    });
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
                        association: "packagingList",
                        include: [{ association: "salesOrderProducts" }]
                    }
                ]
            },
            {
                association: 'truck',
                include: [{ association: 'driver', attributes: ['id', 'username', 'userid', 'role'] }]
            }
        ],
    });
};

export const getDeliveriesForDriver = async (driverUserId: number, statuses?: string[]) => {
    const targetStatuses = statuses || [DELIVERY_STATUS.APPROVED, DELIVERY_STATUS.STARTED, DELIVERY_STATUS.COMPLETED];
    return scoped(Delivery).findAll({
        include: [
            {
                model: Truck,
                as: "truck",
                where: { driverUserId },
                required: true,
                include: [{ association: 'driver', attributes: ['id', 'username', 'userid', 'role'] }] as any
            },
            {
                association: "invoiceDeliveries",
                include: [{ 
                    association: "packagingList",
                    include: [{ association: "salesOrderProducts" }]
                }],
            },
        ],
        where: {
            status: { [Op.in]: targetStatuses }
        },
        order: [["createdAt", "DESC"]],
    });
};

export const getDeliveryStats = async () => {
    return scoped(Delivery).findAll({
        attributes: [
            "status",
            [sequelize.fn("COUNT", sequelize.col("id")), "count"]
        ],
        group: ["status"],
        raw: true
    }) as unknown as Promise<Array<{ status: string; count: string | number }>>;
};
