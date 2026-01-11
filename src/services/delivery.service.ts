import { sequelize } from "../config/database";
import * as deliveryRepository from "../repositories/delivery.repository";
import * as loadingOrderRepository from "../repositories/loadingOrder.repository";
import { DELIVERY_STATUS } from "../constants/tableTypes";

export const initiateDelivery = async (truckId: number, loadingOrderIds: number[], clientId: number) => {
    // 1. Check if truck already has a pending delivery
    const existingPendingDelivery = await deliveryRepository.findPendingDeliveryByTruck(truckId);
    if (existingPendingDelivery) {
        throw new Error("This truck already has a pending delivery. Please complete or cancel the existing delivery before initiating a new one.");
    }

    // 2. Check if any loadingOrder already has an InvoiceDelivery
    const existingInvoiceDeliveries = await deliveryRepository.findInvoiceDeliveriesByLoadingOrderIds(loadingOrderIds);
    if (existingInvoiceDeliveries?.length > 0) {
        const usedIds = existingInvoiceDeliveries.map((d: any) => d.loadingOrderId).join(", ");
        throw new Error(`The following Loading Orders already have a delivery assigned: [${usedIds}]. Please remove them from your request.`);
    }

    const fromLocation = [0, 0];

    return await sequelize.transaction(async (transaction) => {
        // 3. Create Delivery
        const delivery = await deliveryRepository.createDelivery(truckId, clientId, transaction);
        const invoiceDeliveries = [];
        for (const loadingOrderId of loadingOrderIds) {
            // Fetch loadingOrder with nested salesOrder
            const loadingOrder: any = await loadingOrderRepository.getLoadingOrderById(loadingOrderId);

            if (!loadingOrder) {
                throw new Error(`Loading Order with id ${loadingOrderId} not found`);
            }

            const shippingAddress = loadingOrder?.shippingAddress;
            const soLocation = loadingOrder?.salesOrder?.soLocation;

            // ASSUMPTION: In one delivery, all loadingOrders have the same start location
            if (fromLocation[0] === 0 && fromLocation[1] === 0) {
                fromLocation[0] = soLocation.lat;
                fromLocation[1] = soLocation.long;
            }

            if (fromLocation[0] !== soLocation.lat && fromLocation[1] !== soLocation.long) {
                throw new Error(`The Loading Orders have different locations. Please ensure all Loading Orders have the same start location.`);
            }

            if (!shippingAddress || !soLocation) throw new Error(`shippingAddress or soLocation missing for loadingOrder ${loadingOrderId}`);

            const invoiceDelivery = await deliveryRepository.createInvoiceDelivery({
                toLat: shippingAddress.lat,
                toLng: shippingAddress.long,
                toAddress: shippingAddress.address,

                fromAddress: soLocation.address,
                fromLat: soLocation.lat,
                fromLng: soLocation.long,
                loadingOrderId,
                deliveryId: delivery.get('id') as number
            }, transaction);

            invoiceDeliveries.push(invoiceDelivery);
        }
        return { delivery, invoiceDeliveries };
    });
};

export const getAllDeliveriesByClientId = async (filter: any, clientId: number) => {
    return await deliveryRepository.getAllDeliveriesByClientId(filter, clientId);
};

export const approveDeliveryOrders = async (orders: Array<{ id: number, order: number }>) => {

    // Validate that all orders are unique
    const uniqueOrders = [...new Set(orders.map(o => o.order))];
    if (uniqueOrders.length !== orders.length) {
        throw new Error("All order's order number must be unique.");
    }

    return await sequelize.transaction(async (transaction) => {
        // First, get the delivery IDs from the invoice deliveries
        const invoiceDeliveries = await deliveryRepository.findInvoiceDeliveriesByIds(orders.map(o => o.id));

        // If the number of invoice deliveries is not equal to the number of orders, throw an error
        if (invoiceDeliveries.length !== orders.length) {
            throw new Error("All invoice deliveries provided does not exists.");
        }

        // Validate that all invoice deliveries belong to the same delivery
        const deliveryIds = invoiceDeliveries.map((id: any) => id.get('deliveryId') as number);
        const uniqueDeliveryIds = [...new Set(deliveryIds)];

        if (uniqueDeliveryIds.length > 1) {
            throw new Error("All invoice deliveries must belong to the same delivery. Found multiple delivery IDs: " + uniqueDeliveryIds.join(", "));
        }

        const deliveryId: number = uniqueDeliveryIds[0] as number;

        // Update the order of invoice deliveries
        const result = await deliveryRepository.updateInvoiceDeliveryOrders(orders, transaction);

        // Update delivery status to APPROVED for the single delivery
        await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.APPROVED, transaction);

        return result;
    });
};

export const completeDelivery = async (deliveryId: number, clientId: number) => {
    return await sequelize.transaction(async (transaction) => {
        // Find the delivery and verify it belongs to the client
        const delivery = await deliveryRepository.findDeliveryById(deliveryId, clientId);

        if (!delivery) {
            throw new Error(`Delivery with id ${deliveryId} not found or does not belong to your client.`);
        }

        const deliveryData = delivery.get({ plain: true });

        // Check if delivery is already completed
        if (deliveryData.status === DELIVERY_STATUS.COMPLETED) {
            throw new Error("Delivery is already completed.");
        }

        // Check if delivery is approved before completing
        if (deliveryData.status !== DELIVERY_STATUS.APPROVED) {
            throw new Error(`Cannot complete delivery. Delivery must be approved first. Current status: ${deliveryData.status}`);
        }

        // Update delivery status to COMPLETED
        const completedDelivery = await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.COMPLETED, transaction);

        // Fetch updated delivery with associations
        // const completedDelivery = await deliveryRepository.findDeliveryById(deliveryId, clientId);

        return completedDelivery;
    });
};

export const rejectDelivery = async (deliveryId: number, clientId: number) => {
    return await sequelize.transaction(async (transaction) => {
        // Find the delivery and verify it belongs to the client
        const delivery = await deliveryRepository.findDeliveryById(deliveryId, clientId);

        if (!delivery) {
            throw new Error(`Delivery with id ${deliveryId} not found or does not belong to your client.`);
        }

        const deliveryData = delivery.get({ plain: true });

        // Check if delivery is pending before rejecting
        if (deliveryData.status !== DELIVERY_STATUS.PENDING) {
            throw new Error("Only pending deliveries could be rejected.");
        }

        // Update delivery status to REJECTED
        const rejectedDelivery = await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.REJECTED, transaction);

        return rejectedDelivery;
    });
}; 