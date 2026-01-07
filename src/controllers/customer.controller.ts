import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { AuthRequest } from "../middleware/authMiddleware";
import { SuccessResponse } from "../helper/response";
import * as customerService from "../services/customer.service";

//  Controller to handle create creation.
export const createCustomerController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { addresses, ...customerData } = req.body;
  const userId = req.user?.id;
  const clientId = req.user?.clientId;

  // Call service function
  const newCustomer = await customerService.registerCustomer(
    { ...customerData, createdBy: userId, updatedBy: userId },
    addresses,
    Number(clientId)
  );

  return SuccessResponse(res, 201, "Customer created successfully.", newCustomer);
});

// Update Customer
export const updateCustomerController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const updatedCustomer = await customerService.updateCustomer(Number(id), data);
  return SuccessResponse(res, 200, "Customer updated successfully", updatedCustomer);
});

// Get all customers
export const getAllCustomersController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search, ...filter } = req.query;

  const clientId = Number(req.user?.clientId)

  const result = await customerService.fetchAllCustomers(Number(page), Number(limit), clientId, String(search), filter);

  return SuccessResponse(res, 200, "Customers retrieved successfully", result.customers, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Get customer by id
export const getCustomerByIdController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const customer = await customerService.fetchCustomerById(Number(id));
  return SuccessResponse(res, 200, "Customer retrieved successfully", customer);
});

// Get customer minimal data (less detailed)
export const getCustomerMinimalController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = req.user?.clientId;

  const customer = await customerService.getCustomerMinimal(Number(id), Number(clientId));
  return SuccessResponse(res, 200, "Customer minimal data retrieved successfully", customer);
});

// Get all invoices related to a customer
export const getInvoicesByCustomerId = catchAsync(async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.customerId);

  // Call service function to fetch invoices related to the customer ID.
  const data = await customerService.getInvoicesByCustomerId(Number(customerId));
  return SuccessResponse(res, 200, "Invoices fetched successfully", data);
});

// Get all advanced deposits related to a customer
export const getAdvancedDepositsByCustomerId = catchAsync(async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.customerId);

  // Call service function to fetch advanced deposits related to the customer ID.
  const data = await customerService.getAdvancedDepositsByCustomerId(Number(customerId));
  return SuccessResponse(res, 200, "Advanced deposits fetched successfully", data);
}); 