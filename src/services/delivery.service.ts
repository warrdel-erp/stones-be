import { sequelize } from "../config/database";
import * as deliveryRepository from "../repositories/delivery.repository";
import * as soInvoiceRepository from "../repositories/soInvoice.repository";

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

    return await sequelize.transaction(async (transaction) => {
        // 3. Create Delivery
        const delivery = await deliveryRepository.createDelivery(truckId, clientId, transaction);
        const invoiceDeliveries = [];
        for (const soInvoiceId of soInvoiceIds) {
            // Fetch soInvoice with nested loadingOrder -> salesOrder
            const soInvoice: any = await soInvoiceRepository.findSoInvoiceWithAssociations(soInvoiceId, transaction);

            const shippingAddress = soInvoice?.loadingOrder?.salesOrder.shippingAddress;
            const soLocation = soInvoice?.loadingOrder?.salesOrder.soLocation;

            if (!shippingAddress || !soLocation) throw new Error(`shippingAddress or soLocation missing for soInvoice ${soInvoiceId}`);

            const invoiceDelivery = await deliveryRepository.createInvoiceDelivery({
                toLat: shippingAddress.lat,
                toLng: shippingAddress.long,
                fromAddress: shippingAddress.address,
                fromLat: soLocation.lat,
                fromLng: soLocation.long,
                toAddress: soLocation.address,
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