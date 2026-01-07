import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as tradeService from "../services/tradeService.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const createTradeService = catchAsync(async (req: AuthRequest, res: Response) => {
    const payload = { ...req.body };
    const clientId = req.user?.clientId
    const tradeServiceObj = await tradeService.createTradeService({ ...payload, clientId });
    SuccessResponse(res, 201, "TradeService created", tradeServiceObj);
});

export const listTradeServices = catchAsync(async (req: AuthRequest, res: Response) => {
    const filters = req.query;
    const tradeServices = await tradeService.listTradeServices(filters);

    SuccessResponse(res, 200, "TradeServices fetched", tradeServices);
});

export const updateTradeService = catchAsync(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const payload = { ...req.body };

    const updatedTradeService = await tradeService.updateTradeService(id, payload);
    if (!updatedTradeService) {
        return res.status(404).json({ message: "TradeService not found" });
    }
    SuccessResponse(res, 200, "TradeService updated", updatedTradeService);
});

export const deleteTradeService = catchAsync(async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await tradeService.deleteTradeService(id);
    if (!deleted) {
        return res.status(404).json({ message: "TradeService not found" });
    }
    return res.status(204).send();
}); 