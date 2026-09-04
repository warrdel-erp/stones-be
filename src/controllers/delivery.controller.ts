import { Request, Response } from "express";
import * as deliveryService from "../services/delivery.service";
import { ErrorResponse, SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import { DeliveryOrderApprovalInput } from "../validators";

export const initiateDelivery = async (req: AuthRequest, res: Response) => {
    const { truckId, packagingListIds, loadingOrderIds, references } = req.body;
    const clientId = Number(req.user?.clientId);

    // Support new format: references array
    let deliveryReferences: { id: number; referenceType: 'packagingList' | 'loadingOrder' }[] = [];
    if (references && references.length > 0) {
        deliveryReferences = references;
    } else if (packagingListIds && packagingListIds.length > 0) {
        deliveryReferences = packagingListIds.map((id: number) => ({ id, referenceType: 'packagingList' as const }));
    } else if (loadingOrderIds && loadingOrderIds.length > 0) {
        deliveryReferences = loadingOrderIds.map((id: number) => ({ id, referenceType: 'loadingOrder' as const }));
    }

    if (!deliveryReferences.length) {
        ErrorResponse(res, 400, 'References (packagingListIds, loadingOrderIds, or references) are required', {});
        return;
    }

    try {
        const result = await deliveryService.initiateDelivery(truckId, deliveryReferences, clientId);
        SuccessResponse(res, 201, 'Delivery initiated successfully', result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || 'Failed to initiate delivery' });
    }
};


export const getAllDeliveriesByClientId = async (req: AuthRequest, res: Response) => {
    const clientId = Number(req.user?.clientId);

    const { page, limit, ...filters } = req.query;

    try {
        const { rows, count } = await deliveryService.getAllDeliveriesByClientId(
            Number(page),
            Number(limit),
            clientId,
            filters
        );

        SuccessResponse(res, 200, "Deliveries fetched successfully", {
            data: rows,
            paginationData: { page: Number(page), limit: Number(limit), total: count, totalPages: Math.ceil(count / Number(limit)) }
        });

    } catch (err: any) {
        res.status(400).json({
            success: false,
            message: err.message || "Failed to fetch deliveries"
        });
    }
};


export const approveDeliveryOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    // Support both old field name (invoiceDeliveries) and new (deliveryAddresses) for backwards compat
    const { deliveryAddresses, invoiceDeliveries }: any = req.body;
    const orders = deliveryAddresses || invoiceDeliveries;

    try {
        const result = await deliveryService.approveDeliveryOrders(orders);
        SuccessResponse(res, 200, 'Delivery orders approved successfully', result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || 'Failed to approve delivery orders' });
    }
};

export const completeDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
    const { deliveryId } = req.params;
    const clientId = Number(req.user?.clientId);

    if (!deliveryId || isNaN(Number(deliveryId))) {
        ErrorResponse(res, 400, "Valid delivery ID is required", {});
        return;
    }

    try {
        const result = await deliveryService.completeDelivery(Number(deliveryId), clientId);
        SuccessResponse(res, 200, "Delivery completed successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to complete delivery" });
    }
};

export const rejectDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
    const { deliveryId } = req.params;
    const clientId = Number(req.user?.clientId);

    if (!deliveryId || isNaN(Number(deliveryId))) {
        ErrorResponse(res, 400, "Valid delivery ID is required", {});
        return;
    }

    try {
        const result = await deliveryService.rejectDelivery(Number(deliveryId), clientId);
        SuccessResponse(res, 200, "Delivery rejected successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to reject delivery" });
    }
};

export const startDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
    const { deliveryId } = req.params;
    const clientId = Number(req.user?.clientId);

    if (!deliveryId || isNaN(Number(deliveryId))) {
        ErrorResponse(res, 400, "Valid delivery ID is required", {});
        return;
    }

    try {
        const result = await deliveryService.startDeliveryManager(Number(deliveryId), clientId);
        SuccessResponse(res, 200, "Delivery started successfully", result);
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message || "Failed to start delivery" });
    }
};

export const getDeliveryStats = async (req: AuthRequest, res: Response) => {
    try {
        const stats = await deliveryService.getDeliveryStats();
        SuccessResponse(res, 200, "Delivery statistics fetched successfully", stats);
    } catch (err: any) {
        res.status(400).json({
            success: false,
            message: err.message || "Failed to fetch delivery statistics"
        });
    }
}; 