import Delivery from "../models/Delivery.model";
import InvoiceDelivery from "../models/InvoiceDelivery.model";
import { Op, Transaction } from "sequelize";
import { DELIVERY_STATUS } from "../constants/tableTypes";

export const findPendingDeliveryByTruck = async (truckId: number) => {
    return Delivery.findOne({
        where: { truckId, status: DELIVERY_STATUS.PENDING }
    });
};

export const findInvoiceDeliveriesBySoInvoiceIds = async (soInvoiceIds: number[]) => {
    return InvoiceDelivery.findAll({
        where: {
            soInvoiceId: { [Op.in]: soInvoiceIds }
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
        soInvoiceId: number,
        deliveryId: number
    },
    transaction: Transaction
) => {
    return InvoiceDelivery.create(data, { transaction });
};

export const getAllDeliveriesByClientId = async (clientId: number) => {
    return Delivery.findAll({
        where: { clientId },
        order: [["createdAt", "DESC"]],
        include: [
            {
                association: "invoiceDeliveries",
                include: [
                    {
                        association: "soInvoice"
                    }
                ]
            },
            {
                association: 'truck'
            }
        ],
    });
}; 
