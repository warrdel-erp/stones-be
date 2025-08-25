import { sequelize } from "../config/database";
import * as deliveryRepository from "../repositories/delivery.repository";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";
import { DELIVERY_STATUS } from "../constants/tableTypes";

export const initiateDelivery = async (truckId: number, soInvoiceIds: number[], clientId: number) => {
    // 1. Check if truck already has a pending delivery
    const existingPendingDelivery = await deliveryRepository.findPendingDeliveryByTruck(truckId);
    if (existingPendingDelivery) {
        throw new Error("This truck already has a pending delivery. Please complete or cancel the existing delivery before initiating a new one.");
    }

    // 2. Check if any soInvoice already has an InvoiceDelivery
    const existingInvoiceDeliveries = await deliveryRepository.findInvoiceDeliveriesBySoInvoiceIds(soInvoiceIds);
    if (existingInvoiceDeliveries.length > 0) {
        const usedIds = existingInvoiceDeliveries.map((d: any) => d.soInvoiceId).join(", ");
        throw new Error(`The following Sales Order Invoices already have a delivery assigned: [${usedIds}]. Please remove them from your request.`);
    }

    const fromLocation = [0, 0];

    return await sequelize.transaction(async (transaction) => {
        // 3. Create Delivery
        const delivery = await deliveryRepository.createDelivery(truckId, clientId, transaction);
        const invoiceDeliveries = [];
        for (const soInvoiceId of soInvoiceIds) {
            // Fetch soInvoice with nested loadingOrder -> salesOrder
            const soInvoice: any = await soInvoiceRepository.findSoInvoiceWithAssociations(soInvoiceId, transaction);

            const shippingAddress = soInvoice?.loadingOrder?.salesOrder.shippingAddress;
            const soLocation = soInvoice?.loadingOrder?.salesOrder.soLocation;

            // ASSUMPTION: In one delivery, all soInvoices have the same start location
            if (fromLocation[0] === 0 && fromLocation[1] === 0) {
                fromLocation[0] = soLocation.lat;
                fromLocation[1] = soLocation.long;
            }

            if (fromLocation[0] !== soLocation.lat && fromLocation[1] !== soLocation.long) {
                throw new Error(`The Sales Order Invoices have different locations. Please ensure all Sales Order Invoices have the same start location.`);
            }

            if (!shippingAddress || !soLocation) throw new Error(`shippingAddress or soLocation missing for soInvoice ${soInvoiceId}`);

            const invoiceDelivery = await deliveryRepository.createInvoiceDelivery({
                toLat: shippingAddress.lat,
                toLng: shippingAddress.long,
                toAddress: shippingAddress.address,

                fromAddress: soLocation.address,
                fromLat: soLocation.lat,
                fromLng: soLocation.long,
                soInvoiceId,
                deliveryId: delivery.get('id') as number
            }, transaction);

            invoiceDeliveries.push(invoiceDelivery);
        }
        return { delivery, invoiceDeliveries };
    });
};

export const getAllDeliveriesByClientId = async (clientId: number) => {
    return await deliveryRepository.getAllDeliveriesByClientId(clientId);
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
        const deliveryIds = invoiceDeliveries.map(id => id.get('deliveryId') as number);
        const uniqueDeliveryIds = [...new Set(deliveryIds)];

        if (uniqueDeliveryIds.length > 1) {
            throw new Error("All invoice deliveries must belong to the same delivery. Found multiple delivery IDs: " + uniqueDeliveryIds.join(", "));
        }

        const deliveryId = uniqueDeliveryIds[0];

        // Update the order of invoice deliveries
        const result = await deliveryRepository.updateInvoiceDeliveryOrders(orders, transaction);

        // Update delivery status to APPROVED for the single delivery
        await deliveryRepository.updateDeliveryStatus([deliveryId], DELIVERY_STATUS.APPROVED, transaction);

        return result;
    });
}; 