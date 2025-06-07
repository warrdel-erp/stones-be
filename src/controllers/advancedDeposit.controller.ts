import { Request, Response } from "express";
import * as advancedDepositService from "../services/advancedDeposit.service";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";

export const createAdvancedDepositHandler = catchAsync(async (req: AuthRequest, res: Response) => {
    const { amount, salesOrderId, paymentMethod } = req.body;

    const advancedDeposit = await advancedDepositService.createAdvancedDeposit({
        amount,
        salesOrderId,
        paymentMethod
    });

    return res.status(201).json({
        message: "Advanced deposit created successfully",
        data: advancedDeposit,
    });
})
