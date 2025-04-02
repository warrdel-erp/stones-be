import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import { SuccessResponse } from "../helper/response";
import catchAsync from "../helper/asyncCatch";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import { PAYEE_TYPE, PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import * as billRepository from "../repositories/bill.repository";

// create Payment
export const createPayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const { bills, ...payment } = req.body;

  if (!bills) {
    throw new AppError("Bills are required", 400);
  }

  // If payee type is vendor then check if all bills belong to the vendor
  if (payment.payeeType == PAYEE_TYPE.VENDOR) {
    await paymentService.checkIfBillsBelongToVendor(payment.payeeId, bills);
  }

  const newPayment = await paymentService.processPayment({ ...payment, clientId }, bills);
  return SuccessResponse(res, 201, "Payment processed successfully", newPayment);
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

// Get new Bill number
export const getNewTransactionNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = await paymentService.getTransactionNumber(clientId!);
  SuccessResponse(res, 200, "New Bill number fetched successfully.", data);
});
