import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as customerAddressService from "../services/customerAddress.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { CUSTOMER_ADDRESS_TYPES } from "../constants/tableTypes";

export const createCustomerAddress = catchAsync(async (req: Request, res: Response) => {
  const customerAddress = await customerAddressService.createCustomerAddress(req.body);
  SuccessResponse(res, 201, "Customer address created successfully", customerAddress);
});

export const getAddressesByCustomerId = catchAsync(async (req: Request, res: Response) => {
  const { customerId } = req.params;

  const { addressType } = req.query as {
    addressType: (typeof CUSTOMER_ADDRESS_TYPES)[keyof typeof CUSTOMER_ADDRESS_TYPES];
  }; // Optional filter from query params

  const addresses = await customerAddressService.getAddressesByCustomerId(Number(customerId), addressType);

  return res.status(200).json({
    message: "Customer addresses retrieved successfully",
    data: addresses,
  });
});

export const getCustomerAddressById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = req.user?.clientId;

  const address = await customerAddressService.getCustomerAddressById(Number(id), Number(clientId));

  SuccessResponse(res, 200, "Customer address retrieved successfully", address);
});
