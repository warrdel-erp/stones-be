import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as wiringInstructionService from "../services/wiringInstruction.service";

/**
 * Controller to handle wiring instruction creation.
 */
export const createWiringInstructionController = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = req.body;
    const clientId = req.user?.clientId;
    const accountId = req.user?.accountId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    if (!accountId) {
        throw new AppError("AccountId is missing from user authentication", 401);
    }

    const newInstruction = await wiringInstructionService.createWiringInstruction(
        data, 
        Number(clientId), 
        Number(accountId)
    );

    return SuccessResponse(res, 201, "Wiring instruction created successfully.", newInstruction);
});

/**
 * Controller to handle wiring instruction update.
 */
export const updateWiringInstructionController = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const clientId = req.user?.clientId;
    const accountId = req.user?.accountId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    if (!accountId) {
        throw new AppError("AccountId is missing from user authentication", 401);
    }

    const updatedInstruction = await wiringInstructionService.updateWiringInstruction(
        Number(id), 
        data, 
        Number(clientId),
        Number(accountId)
    );

    return SuccessResponse(res, 200, "Wiring instruction updated successfully", updatedInstruction);
});

/**
 * Controller to handle wiring instruction deletion.
 */
export const deleteWiringInstructionController = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    const result = await wiringInstructionService.deleteWiringInstruction(Number(id), Number(clientId));

    return SuccessResponse(res, 200, "Wiring instruction deleted successfully", result);
});

/**
 * Controller to fetch all wiring instructions with pagination.
 */
export const getAllWiringInstructionsController = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit, ...filter }: any = req.query;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    const result = await wiringInstructionService.getAllWiringInstructions(
        Number(page) || 1, 
        Number(limit) || 10, 
        Number(clientId),
        filter
    );

    return SuccessResponse(res, 200, "Wiring instructions retrieved successfully", result.data, {
        total: result.total,
        page: result.page,
        limit: result.limit,
    });
});


/**
 * Controller to fetch a specific wiring instruction by ID.
 */
export const getWiringInstructionByIdController = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    const instruction = await wiringInstructionService.findWiringInstructionById(Number(id), Number(clientId));

    return SuccessResponse(res, 200, "Wiring instruction fetched successfully", instruction);
});
