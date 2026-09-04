import { sequelize } from '../config/database';
import * as deliveryRepository from '../repositories/delivery.repository';
import * as packagingListRepository from '../repositories/packagingList.repository';
import * as loadingOrderRepository from '../repositories/loadingOrder.repository';
import * as truckRepository from '../repositories/truck.repository';
import { DELIVERY_STATUS, TRUCK_STATUS, ACTIVITY_TYPE, ACTIVITY_REFERENCE_TYPE } from '../constants/tableTypes';
import * as activityService from '../services/activity.service';
import { requestContext } from '../utils/requestContext';
import { AppError } from '../helper/appError';

type DeliveryReference = { id: number; referenceType: 'packagingList' | 'loadingOrder' };

export const initiateDelivery = async (
    truckId: number,
    references: DeliveryReference[],
    clientId: number
) => {
    const truckData = await truckRepository.findByIdSimple(truckId);

    if (truckData?.status !== TRUCK_STATUS.AVAILABLE) {
        throw new AppError('Truck is not available.', 400);
    }

    // Check if any reference already has an active delivery
    const plIds = references.filter(r => r.referenceType === 'packagingList').map(r => r.id);
    const loIds = references.filter(r => r.referenceType === 'loadingOrder').map(r => r.id);

    if (plIds.length > 0) {
        const existing = await deliveryRepository.findExistingDeliveryAddressesByReferenceIds(plIds, 'packagingList');
        if (existing.length > 0) {
            const usedIds = existing.map((d: any) => d.get('referenceId')).join(', ');
            throw new AppError(`The following Packaging Lists already have a delivery assigned: [${usedIds}].`, 400);
        }
    }
    if (loIds.length > 0) {
        const existing = await deliveryRepository.findExistingDeliveryAddressesByReferenceIds(loIds, 'loadingOrder');
        if (existing.length > 0) {
            const usedIds = existing.map((d: any) => d.get('referenceId')).join(', ');
            throw new AppError(`The following Loading Orders already have a delivery assigned: [${usedIds}].`, 400);
        }
    }

    const existingPendingDelivery = await deliveryRepository.findPendingDeliveryByTruck(truckId);

    const fromLocation = [0, 0];

    return await sequelize.transaction(async (transaction) => {
        let delivery = existingPendingDelivery;
        if (delivery) {
            // Get fromLocation from existing deliveryAddresses if any
            const existing = await deliveryRepository.findDeliveryById(delivery.get('id') as number);
            const firstAddr = (existing?.get({ plain: true }) as any)?.deliveryAddresses?.[0];
            if (firstAddr) {
                fromLocation[0] = firstAddr.fromLat;
                fromLocation[1] = firstAddr.fromLng;
            }
        } else {
            delivery = await deliveryRepository.createDelivery(truckId, clientId, transaction);
        }

        const deliveryId = delivery.get('id') as number;
        const deliveryAddresses = [];

        for (const ref of references) {
            let soLocation: any, shippingAddress: any, salesOrderProducts: any[];

            if (ref.referenceType === 'packagingList') {
                const pl: any = await packagingListRepository.getPackagingListById(ref.id);
                if (!pl) throw new AppError(`Packaging List ${ref.id} not found`, 404);
                soLocation = pl.salesOrder?.soLocation;
                shippingAddress = pl.shippingAddress;
                salesOrderProducts = pl.salesOrderProducts || [];
            } else {
                // loadingOrder
                const lo: any = (await loadingOrderRepository.getLoadingOrderById(ref.id));
                if (!lo) throw new AppError(`Loading Order ${ref.id} not found`, 404);
                // soLocation from LO's own salesOrder or its PL's salesOrder
                soLocation = lo.salesOrder?.soLocation || lo.packagingList?.salesOrder?.soLocation;
                // shipping address: prefer PL's shippingAddress, then salesOrder shippingAddress
                shippingAddress = lo.packagingList?.shippingAddress || lo.salesOrder?.shippingAddress;
                salesOrderProducts = lo.salesOrderProducts || [];
            }

            if (!soLocation || (!soLocation.lat && !soLocation.long)) {
                throw new AppError(`soLocation missing for ${ref.referenceType} ${ref.id}`, 400);
            }
            if (!shippingAddress) {
                throw new AppError(`shippingAddress missing for ${ref.referenceType} ${ref.id}`, 400);
            }

            // Validate consistent fromLocation
            if (fromLocation[0] === 0 && fromLocation[1] === 0) {
                fromLocation[0] = soLocation.lat;
                fromLocation[1] = soLocation.long;
            } else if (fromLocation[0] !== soLocation.lat || fromLocation[1] !== soLocation.long) {
                throw new AppError('All references must share the same pickup location (soLocation).', 400);
            }

            if (!salesOrderProducts.length) {
                throw new AppError(`No salesOrderProducts found for ${ref.referenceType} ${ref.id}`, 400);
            }

            const deliveryAddress = await deliveryRepository.createDeliveryAddress({
                deliveryId,
                fromLat: soLocation.lat,
                fromLng: soLocation.long,
                fromAddress: soLocation.address || '',
                toLat: shippingAddress.lat,
                toLng: shippingAddress.long,
                toAddress: shippingAddress.address || shippingAddress.addressLine || '',
                referenceType: ref.referenceType,
                referenceId: ref.id,
            }, transaction);

            const deliveryAddressId = deliveryAddress.get('id') as number;
            const items = salesOrderProducts.map((sop: any) => ({
                deliveryAddressId,
                deliveryId,
                salesOrderProductId: sop.id,
            }));

            await deliveryRepository.bulkCreateDeliveryItems(items, transaction);
            deliveryAddresses.push(deliveryAddress);
        }

        await activityService.logActivity({
            clientId,
            activityType: ACTIVITY_TYPE.DELIVERY_INITIATION,
            referenceId: deliveryId,
            referenceType: ACTIVITY_REFERENCE_TYPE.DELIVERY,
            title: 'Delivery Initiated',
            description: `Delivery initiated for Truck #${truckId}.`,
        }, transaction);

        return { delivery, deliveryAddresses };
    });
};

export const getAllDeliveriesByClientId = async (page: number, limit: number, clientId: number, filters?: { [key: string]: any }) => {
    return await deliveryRepository.getAllDeliveriesByClientId(page, limit, clientId, filters);
};

export const approveDeliveryOrders = async (orders: Array<{ id: number; order: number }>) => {
    const uniqueOrders = [...new Set(orders.map(o => o.order))];
    if (uniqueOrders.length !== orders.length) {
        throw new Error("All order's order number must be unique.");
    }

    return await sequelize.transaction(async (transaction) => {
        const deliveryAddresses = await deliveryRepository.findDeliveryAddressesByIds(orders.map(o => o.id));

        if (deliveryAddresses.length !== orders.length) {
            throw new Error('All delivery address IDs provided do not exist.');
        }

        const deliveryIds = deliveryAddresses.map((da: any) => da.get('deliveryId') as number);
        const uniqueDeliveryIds = [...new Set(deliveryIds)];

        if (uniqueDeliveryIds.length > 1) {
            throw new Error('All delivery addresses must belong to the same delivery. Found multiple delivery IDs: ' + uniqueDeliveryIds.join(', '));
        }

        const deliveryId: number = uniqueDeliveryIds[0] as number;

        const result = await deliveryRepository.updateDeliveryAddressOrders(orders, transaction);

        await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.APPROVED, transaction);

        const delivery = await deliveryRepository.findDeliveryById(deliveryId);
        if (delivery && delivery.get('truckId')) {
            await truckRepository.update(delivery.get('truckId') as number, { status: TRUCK_STATUS.IN_APPROVED_DELIVERY });
        }

        await activityService.logActivity({
            clientId: requestContext.getStore()?.clientId || 0,
            activityType: ACTIVITY_TYPE.DELIVERY_APPROVAL,
            referenceId: deliveryId,
            referenceType: ACTIVITY_REFERENCE_TYPE.DELIVERY,
            title: 'Delivery Approved',
            description: `Delivery #${deliveryId} has been approved.`,
        }, transaction);

        return result;
    });
};

export const completeDelivery = async (deliveryId: number, clientId: number) => {
    return await sequelize.transaction(async (transaction) => {
        const delivery = await deliveryRepository.findDeliveryById(deliveryId, clientId);
        if (!delivery) throw new Error(`Delivery with id ${deliveryId} not found or does not belong to your client.`);
        const deliveryData = delivery.get({ plain: true }) as any;
        if (deliveryData.status === DELIVERY_STATUS.COMPLETED) throw new Error('Delivery is already completed.');
        if (deliveryData.status !== DELIVERY_STATUS.STARTED) throw new Error(`Cannot complete delivery. Delivery must be started first. Current status: ${deliveryData.status}`);
        const completedDelivery = await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.COMPLETED, transaction);
        if (deliveryData.truckId) await truckRepository.update(deliveryData.truckId, { status: TRUCK_STATUS.AVAILABLE });
        return completedDelivery;
    });
};

export const rejectDelivery = async (deliveryId: number, clientId: number) => {
    return await sequelize.transaction(async (transaction) => {
        const delivery = await deliveryRepository.findDeliveryById(deliveryId, clientId);
        if (!delivery) throw new Error(`Delivery with id ${deliveryId} not found or does not belong to your client.`);
        const deliveryData = delivery.get({ plain: true }) as any;
        if (deliveryData.status !== DELIVERY_STATUS.PENDING) throw new Error('Only pending deliveries could be rejected.');
        const rejectedDelivery = await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.REJECTED, transaction);
        await activityService.logActivity({
            clientId,
            activityType: ACTIVITY_TYPE.DELIVERY_REJECTION,
            referenceId: deliveryId,
            referenceType: ACTIVITY_REFERENCE_TYPE.DELIVERY,
            title: 'Delivery Rejected',
            description: `Delivery #${deliveryId} has been rejected.`,
        }, transaction);
        return rejectedDelivery;
    });
};

export const getDeliveriesForDriver = async (driverUserId: number, statuses?: string[]) => {
    return deliveryRepository.getDeliveriesForDriver(driverUserId, statuses);
};

export const startDelivery = async (deliveryId: number, driverUserId: number) => {
    return await sequelize.transaction(async (transaction) => {
        const delivery = await deliveryRepository.findDeliveryById(deliveryId);
        if (!delivery) throw new Error(`Delivery with id ${deliveryId} not found.`);
        const deliveryData = delivery.get({ plain: true }) as any;
        if (deliveryData.truck?.driverUserId !== driverUserId) throw new Error('You are not the assigned driver for this delivery.');
        if (deliveryData.status !== DELIVERY_STATUS.APPROVED) throw new Error(`Delivery must be approved before it can be started. Current status: ${deliveryData.status}`);
        await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.STARTED, transaction);
        if (deliveryData.truckId) await truckRepository.update(deliveryData.truckId, { status: TRUCK_STATUS.ON_DELIVERY });
        return deliveryRepository.findDeliveryById(deliveryId);
    });
};

export const driverCompleteDelivery = async (deliveryId: number, driverUserId: number) => {
    return await sequelize.transaction(async (transaction) => {
        const delivery = await deliveryRepository.findDeliveryById(deliveryId);
        if (!delivery) throw new Error(`Delivery with id ${deliveryId} not found.`);
        const deliveryData = delivery.get({ plain: true }) as any;
        if (deliveryData.truck?.driverUserId !== driverUserId) throw new Error('You are not the assigned driver for this delivery.');
        if (deliveryData.status !== DELIVERY_STATUS.STARTED) throw new Error(`Delivery must be started before it can be completed. Current status: ${deliveryData.status}`);
        await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.COMPLETED, transaction);
        await truckRepository.update(deliveryData.truckId, { status: TRUCK_STATUS.AVAILABLE });
        return deliveryRepository.findDeliveryById(deliveryId);
    });
};

export const startDeliveryManager = async (deliveryId: number, clientId: number) => {
    return await sequelize.transaction(async (transaction) => {
        const delivery = await deliveryRepository.findDeliveryById(deliveryId, clientId);
        if (!delivery) throw new AppError(`Delivery with id ${deliveryId} not found or does not belong to your client.`, 404);
        const deliveryData = delivery.get({ plain: true }) as any;
        if (deliveryData.status !== DELIVERY_STATUS.APPROVED) throw new AppError(`Delivery must be approved before it can be started. Current status: ${deliveryData.status}`, 400);
        await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.STARTED, transaction);
        if (deliveryData.truckId) await truckRepository.update(deliveryData.truckId, { status: TRUCK_STATUS.ON_DELIVERY });
        await activityService.logActivity({
            clientId,
            activityType: ACTIVITY_TYPE.DELIVERY_INITIATION,
            referenceId: deliveryId,
            referenceType: ACTIVITY_REFERENCE_TYPE.DELIVERY,
            title: 'Delivery Dispatched',
            description: `Delivery #${deliveryId} has been dispatched by manager.`,
        }, transaction);
        return deliveryRepository.findDeliveryById(deliveryId);
    });
};

export const getDeliveryStats = async () => {
    const rawStats = await deliveryRepository.getDeliveryStats();
    const stats: Record<string, number> = {
        pending: 0, approved: 0, started: 0, canceled: 0, rejected: 0, completed: 0
    };
    rawStats.forEach((item) => {
        if (item.status && stats[item.status] !== undefined) {
            stats[item.status] = Number(item.count || 0);
        }
    });
    return stats;
};