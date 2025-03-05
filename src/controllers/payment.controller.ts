import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import { SuccessResponse } from "../helper/response";
import catchAsync from "../helper/asyncCatch";
import { AppError } from "../helper/appError";

// create Payment
export const createPayment = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.createPayment(req.body);
  return SuccessResponse(res, 201, "Payment created successfully", payment);
});

// get all payments
export const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const payments = await paymentService.getPayments(req.query);
  return SuccessResponse(res, 200, "Payments fetched successfully", payments);
});

// get payment by id
export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.getPayment(Number(req.params.id));
  if (!payment) throw new AppError("Payment not found", 404);
  return SuccessResponse(res, 200, "Payment retrieved successfully", payment);
});
