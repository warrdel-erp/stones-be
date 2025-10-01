import { Request, Response } from "express";
import * as deliveryService from "../services/delivery.service";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import { DeliveryOrderApprovalInput } from "../validators";

export const initiateDelivery = async (req: AuthRequest, res: Response) => {
    const { truckId, soInvoiceIds } = req.body;
    const clientId = Number(req.user?.clientId);
    try {
        const result = await deliveryService.initiateDelivery(truckId, soInvoiceIds, clientId);
        SuccessResponse(res, 201, "Delivery initiated successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to initiate delivery" });
    }
};

export const getAllDeliveriesByClientId = async (req: AuthRequest, res: Response) => {
    const clientId = Number(req.user?.clientId);

    const filters = req.query;

    try {
        const deliveries = await deliveryService.getAllDeliveriesByClientId(filters, clientId);
        SuccessResponse(res, 200, "Deliveries fetched successfully", deliveries);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to fetch deliveries" });
    }
};

export const approveDeliveryOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    const { invoiceDeliveries }: DeliveryOrderApprovalInput = req.body;

    try {
        const result = await deliveryService.approveDeliveryOrders(invoiceDeliveries);
        SuccessResponse(res, 200, "Delivery orders approved successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to approve delivery orders" });
    }
}; 