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
export const getAllCustomersController = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;

  const result = await customerService.fetchAllCustomers(page, limit, search);

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

// Get all invoices related to a customer
export const getInvoicesByCustomerId = catchAsync(async (req: Request, res: Response) => {
  const customerId = parseInt(req.params.customerId);

  // Call service function to fetch invoices related to the customer ID.
  const data = await customerService.getInvoicesByCustomerId(Number(customerId));
  return SuccessResponse(res, 200, "Invoices fetched successfully", data);
});