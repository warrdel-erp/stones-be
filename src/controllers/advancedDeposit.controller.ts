import { Response } from "express";
import * as advancedDepositService from "../services/advancedDeposit.service";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { CreateAdvancedDepositInput } from "../validators";
import { SuccessResponse } from "../helper/response";

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
