import * as models from '../models';
import Truck from '../models/truck.model';
import { Op, Transaction } from 'sequelize';
import { DELIVERY_STATUS } from '../constants/tableTypes';
import { scoped } from '../utils/scoped';
import { sequelize } from '../config/database';

export const findPendingDeliveryByTruck = async (truckId: number) => {
    return scoped(models.Delivery).findOne({
        where: { truckId, status: DELIVERY_STATUS.PENDING }
    });
};

export const checkTruckIsOccupied = async (truckId: number) => {
    return scoped(models.Delivery).findOne({
        where: { truckId, status: { [Op.in]: [DELIVERY_STATUS.APPROVED, DELIVERY_STATUS.STARTED, DELIVERY_STATUS.PENDING] } }
    });
};

/** Check if any reference (PL or LO) already has an active delivery address */
export const findExistingDeliveryAddressesByReferenceIds = async (
    referenceIds: number[],
    referenceType: 'packagingList' | 'loadingOrder'
) => {
    return scoped(models.DeliveryAddress).findAll({
        where: { referenceId: { [Op.in]: referenceIds }, referenceType },
        include: [
            {
                association: 'delivery',
                where: { status: { [Op.ne]: DELIVERY_STATUS.REJECTED } }
            }
        ]
    });
};

export const createDelivery = async (truckId: number, clientId: number, transaction: Transaction) => {
    return scoped(models.Delivery).create({ truckId, clientId, status: DELIVERY_STATUS.PENDING }, { transaction });
};

export const createDeliveryAddress = async (
    data: {
        deliveryId: number;
        fromLat: number;
        fromLng: number;
        fromAddress: string;
        toLat: number;
        toLng: number;
        toAddress: string;
        referenceType: 'packagingList' | 'loadingOrder';
        referenceId: number;
    },
    transaction: Transaction
) => {
    return scoped(models.DeliveryAddress).create(data, { transaction });
};

export const bulkCreateDeliveryItems = async (
    items: { deliveryAddressId: number; deliveryId: number; salesOrderProductId: number }[],
    transaction: Transaction
) => {
    return scoped(models.DeliveryItem).bulkCreate(items, { transaction });
};

const deliveryIncludeWithAddresses = [
    {
        association: 'deliveryAddresses',
        include: [
            {
                association: 'deliveryItems',
                include: [
                    {
                        association: 'salesOrderProduct',
                        include: [{ association: 'inventoryProduct' }]
                    }
                ]
            },
            { association: 'packagingList', attributes: ['id', 'code'] },
            { association: 'loadingOrder', attributes: ['id', 'code'] },
        ]
    },
    {
        association: 'truck',
        include: [{ association: 'driver', attributes: ['id', 'username', 'userid', 'role'] }]
    }
];

export const getAllDeliveriesByClientId = async (page: number, limit: number, clientId: number, filters?: any) => {
    const offset = (page - 1) * limit;
    return await scoped(models.Delivery).findAndCountAll({
        where: { clientId, ...filters },
        order: [['createdAt', 'DESC']],
        include: deliveryIncludeWithAddresses,
        limit,
        offset,
        distinct: true,
    });
};

export const updateDeliveryAddressOrders = async (orders: Array<{ id: number; order: number }>, transaction?: Transaction) => {
    const updates = orders.map(({ id, order }) =>
        scoped(models.DeliveryAddress).update({ order }, {
            where: { id },
            transaction
        })
    );
    return Promise.all(updates);
};

export const findDeliveryAddressesByIds = async (ids: number[]) => {
    return scoped(models.DeliveryAddress).findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ['id', 'deliveryId']
    });
};

export const updateDeliveryStatus = async (deliveryIds: number[], status: string, transaction?: Transaction) => {
    return scoped(models.Delivery).update(
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
    return scoped(models.Delivery).findOne({
        where,
        include: deliveryIncludeWithAddresses,
    });
};

export const getDeliveriesForDriver = async (driverUserId: number, statuses?: string[]) => {
    const targetStatuses = statuses || [DELIVERY_STATUS.APPROVED, DELIVERY_STATUS.STARTED, DELIVERY_STATUS.COMPLETED];
    return scoped(models.Delivery).findAll({
        include: [
            {
                model: Truck,
                as: 'truck',
                where: { driverUserId },
                required: true,
                include: [{ association: 'driver', attributes: ['id', 'username', 'userid', 'role'] }] as any
            },
            {
                association: 'deliveryAddresses',
                include: [
                    {
                        association: 'deliveryItems',
                        include: [{ association: 'salesOrderProduct' }]
                    },
                    { association: 'packagingList', attributes: ['id', 'code'] },
                    { association: 'loadingOrder', attributes: ['id', 'code'] },
                ]
            },
        ],
        where: {
            status: { [Op.in]: targetStatuses }
        },
        order: [['createdAt', 'DESC']],
    });
};

export const getDeliveryStats = async () => {
    return scoped(models.Delivery).findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
    }) as unknown as Promise<Array<{ status: string; count: string | number }>>;
};
