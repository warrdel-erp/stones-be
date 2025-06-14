import { Request, Response } from "express";
import * as advancedDepositService from "../services/advancedDeposit.service";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { CreateAdvancedDepositInput } from "../validators";

export const createAdvancedDepositHandler = catchAsync(async (req: AuthRequest, res: Response) => {
    const advancedDepositData: CreateAdvancedDepositInput = req.body;
    const locationId = req.user?.defaultLocationId;

    const advancedDeposit = await advancedDepositService.createAdvancedDeposit(advancedDepositData, Number(locationId));

    return res.status(201).json({
        message: "Advanced deposit created successfully",
        data: advancedDeposit,
    });
})
