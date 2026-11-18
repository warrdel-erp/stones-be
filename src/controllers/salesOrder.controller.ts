import { Request, Response } from "express";
import * as salesOrderService from "../services/salesOrder.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import { AppError } from "../helper/appError";

// Create new SO
export const createSalesOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  console.log("----")
  console.log("hit 1")
  const clientId = req.user?.clientId;
  const accountId = req.user?.accountId;
  const locationId = req.user?.defaultLocationId

  const salesOrder = await salesOrderService.createSalesOrder({ ...req.body, accountId, createdById: accountId, clientId, locationId });
  SuccessResponse(res, 201, "Sales Order created successfully", salesOrder);
});

// Get all SO
export const getAllSalesOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, sort, ...filter }: any = req.query;

  const clientId = req.user?.clientId;

  const result = await salesOrderService.getAllSalesOrders(Number(page), Number(limit), Number(clientId), filter);

  SuccessResponse(res, 200, "Sales Orders retrieved successfully", result.data, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

// Get SO by ID
export const getSalesOrderSummary = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const summary = await salesOrderService.getSalesOrderSummary(Number(id));

  if (!summary) {
    return SuccessResponse(res, 404, "Sales Order not found", null);
  }

  SuccessResponse(res, 200, "Sales Order summary retrieved successfully", summary);
});

export const getSalesOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const salesOrder = await salesOrderService.getSalesOrderById(Number(id));

  if (!salesOrder) {
    return SuccessResponse(res, 404, "Sales Order not found", null);
  }

  SuccessResponse(res, 200, "Sales Order retrieved successfully", salesOrder);
});

// Get SO by ID

export const getSalesOrderByIdForCreateActualLO = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const salesOrder = await salesOrderService.getSalesOrderByIdForCreateActualLO(Number(id));

  if (!salesOrder) {
    return SuccessResponse(res, 404, "Sales Order not found", null);
  }

  SuccessResponse(res, 200, "Sales Order retrieved successfully", salesOrder);
});

export const getSalesOrderByIdForCreateLO = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const salesOrder = await salesOrderService.getSalesOrderByIdForCreateLO(Number(id));

  if (!salesOrder) {
    return SuccessResponse(res, 404, "Sales Order not found", null);
  }

  SuccessResponse(res, 200, "Sales Order retrieved successfully", salesOrder);
});

// Get new SO number
export const getNewSoNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = await salesOrderService.getSONumber(clientId!);
  SuccessResponse(res, 200, "New SO number fetched successfully.", data);
});

// Get total paid amount for an SO.
export const getPaidAmountForSO = catchAsync(async (req: AuthRequest, res: Response) => {

  const { id } = req.params

  const data = await salesOrderService.getPaidAmountForSO(Number(id));

  return SuccessResponse(res, 200, 'Total paid amount fetched successfully for given SO.', data)
})

// Update sales order tax
export const updateSalesOrderTax = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { taxId } = req.body;
  const clientId = req.user?.clientId;

  if (!taxId) {
    throw new AppError("taxId is required", 400);
  }

  const salesOrder = await salesOrderService.updateSalesOrderTax(Number(id), Number(taxId), Number(clientId!));
  SuccessResponse(res, 200, "Sales Order tax updated successfully", salesOrder);
});

// Update sales order discount
export const updateSalesOrderDiscount = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { discountPercentage } = req.body;
  const clientId = Number(req.user?.clientId);

  const data = await salesOrderService.updateSalesOrderDiscount(
    Number(id),
    Number(discountPercentage),
    clientId
  );

  const message = data.frozenCount
    ? `SO discount updated for ${data.updatedCount} product(s). ${data.frozenCount} invoiced product(s) were not changed.`
    : "Sales Order discount updated successfully";

  return SuccessResponse(res, 200, message, data);
});

// Publish Sales Order
export const publishSalesOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = Number(req.user?.clientId);
  const accountId = Number(req.user?.accountId);

  const salesOrder = await salesOrderService.publishSalesOrder(Number(id), clientId, accountId);
  return SuccessResponse(res, 200, "Sales Order published successfully", salesOrder);
});

// Update Sales Order
export const updateSalesOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const clientId = Number(req.user?.clientId);

  const updatedSalesOrder = await salesOrderService.updateSalesOrder(Number(id), req.body, clientId);
  return SuccessResponse(res, 200, "Sales Order updated successfully", updatedSalesOrder);
});

