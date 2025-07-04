import { Request, Response } from "express";
import * as deliveryService from "../services/delivery.service";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";

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
    try {
        const deliveries = await deliveryService.getAllDeliveriesByClientId(clientId);
        SuccessResponse(res, 200, "Deliveries fetched successfully", deliveries);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to fetch deliveries" });
    }
}; 