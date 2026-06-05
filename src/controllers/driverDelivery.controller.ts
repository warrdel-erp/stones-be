import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as deliveryService from "../services/delivery.service";
import { SuccessResponse, ErrorResponse } from "../helper/response";
import { DELIVERY_STATUS } from "../constants/tableTypes";

export const getDriverCurrentDeliveries = async (req: AuthRequest, res: Response) => {
    const driverUserId = Number(req.user?.id);
    try {
        const result = await deliveryService.getDeliveriesForDriver(driverUserId, [DELIVERY_STATUS.APPROVED, DELIVERY_STATUS.STARTED]);
        SuccessResponse(res, 200, "Driver current deliveries fetched successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to fetch driver current deliveries" });
    }
};

export const getDriverCompletedDeliveries = async (req: AuthRequest, res: Response) => {
    const driverUserId = Number(req.user?.id);
    try {
        const result = await deliveryService.getDeliveriesForDriver(driverUserId, [DELIVERY_STATUS.COMPLETED]);
        SuccessResponse(res, 200, "Driver completed deliveries fetched successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to fetch driver completed deliveries" });
    }
};

export const getDriverDeliveries = async (req: AuthRequest, res: Response) => {
    const driverUserId = Number(req.user?.id);
    try {
        const result = await deliveryService.getDeliveriesForDriver(driverUserId);
        SuccessResponse(res, 200, "Driver deliveries fetched successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to fetch driver deliveries" });
    }
};

export const driverStartDelivery = async (req: AuthRequest, res: Response) => {
    const { deliveryId } = req.params;
    const driverUserId = Number(req.user?.id);

    if (!deliveryId || isNaN(Number(deliveryId))) {
        ErrorResponse(res, 400, "Valid delivery ID is required", {});
        return;
    }

    try {
        const result = await deliveryService.startDelivery(Number(deliveryId), driverUserId);
        SuccessResponse(res, 200, "Delivery started successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to start delivery" });
    }
};

export const driverCompleteDelivery = async (req: AuthRequest, res: Response) => {
    const { deliveryId } = req.params;
    const driverUserId = Number(req.user?.id);

    if (!deliveryId || isNaN(Number(deliveryId))) {
        ErrorResponse(res, 400, "Valid delivery ID is required", {});
        return;
    }

    try {
        const result = await deliveryService.driverCompleteDelivery(Number(deliveryId), driverUserId);
        SuccessResponse(res, 200, "Delivery completed successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to complete delivery" });
    }
};
