import { Response } from "express";
import * as advancedDepositService from "../services/advancedDeposit.service";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { CreateAdvancedDepositInput } from "../validators";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";

export const getMaxDepositAmount = catchAsync(async (req: AuthRequest, res: Response) => {
    const { salesOrderId } = req.query;

    if (!salesOrderId) {
        throw new AppError("salesOrderId is required", 400);
    }

    const maxAmount = await advancedDepositService.getMaxDepositAmountForSO(Number(salesOrderId));
    return SuccessResponse(res, 200, 'Max deposit amount calculated successfully', { maxAmount });
});

export const createAdvancedDepositHandler = catchAsync(async (req: AuthRequest, res: Response) => {
    const advancedDepositData: CreateAdvancedDepositInput = req.body;
    const locationId = req.user?.defaultLocationId;

    const advancedDeposit = await advancedDepositService.createAdvancedDeposit(advancedDepositData, Number(locationId));

    return SuccessResponse(res, 201, 'Advanced deposit created successfully', advancedDeposit)
})

export const getAdvancedDepositWithoutPagination = catchAsync(async (req: AuthRequest, res: Response) => {
    const { ...filters } = req.query

    const data = await advancedDepositService.getAdvancedDepositWithoutPagination(filters as Record<string, string>);

    return SuccessResponse(res, 200, 'Advanced Deposit get successfully without pagination', data)
})

export const getAdvancedDepositById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const advancedDeposit = await advancedDepositService.getAdvancedDepositById(Number(id));

    if (!advancedDeposit) {
        throw new AppError("Advanced deposit not found", 404);
    }

    return SuccessResponse(res, 200, "Advanced Deposit fetched successfully", advancedDeposit);
});

export const settleAdvancedDeposit = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { settlements } = req.body;

    if (!settlements || !Array.isArray(settlements) || settlements.length === 0) {
        throw new AppError("settlements array is required and must not be empty.", 400);
    }

    // Validate each settlement has required fields
    for (const settlement of settlements) {
        if (!settlement.invoiceId) {
            throw new AppError("Each settlement must have invoiceId.", 400);
        }
        if (!settlement.amount || Number(settlement.amount) <= 0) {
            throw new AppError("Each settlement must have amount greater than 0.", 400);
        }
    }

    const result = await advancedDepositService.settleAdvancedDeposit(
        Number(id),
        settlements
    );

    return SuccessResponse(res, 200, "Advanced deposit settled successfully", result);
});
