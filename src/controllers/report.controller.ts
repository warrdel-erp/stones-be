import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as reportService from "../services/report.service";

export const getInventorySummaryReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getInventorySummaryReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Inventory summary report retrieved successfully", result);
});

export const getSlabInventoryDetail = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getSlabInventoryDetail(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Slab inventory detail report retrieved successfully", result);
});

export const getInventoryValuationReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getInventoryValuationReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Inventory valuation report retrieved successfully", result);
});

export const getInventoryAgingReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getInventoryAgingReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Inventory aging report retrieved successfully", result);
});

export const getHeldInventoryReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getHeldInventoryReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Held inventory report retrieved successfully", result);
});

export const getSalesOrderRegisterReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getSalesOrderRegisterReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Sales order register report retrieved successfully", result);
});

export const getSlabSalesDetailReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getSlabSalesDetailReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Slab sales detail report retrieved successfully", result);
});

export const getSalesByCustomerReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getSalesByCustomerReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Sales by customer report retrieved successfully", result);
});

export const getSalesByProductReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getSalesByProductReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Sales by product report retrieved successfully", result);
});

export const getSalesProfitabilityReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getSalesProfitabilityReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Sales profitability report retrieved successfully", result);
});

export const getPurchaseOrderRegisterReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getPurchaseOrderRegisterReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Purchase order register report retrieved successfully", result);
});

export const getPurchaseDetailReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getPurchaseDetailReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Purchase detail report retrieved successfully", result);
});

export const getPurchasesBySupplierReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getPurchasesBySupplierReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Purchases by supplier report retrieved successfully", result);
});

export const getInvoiceRegisterReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getInvoiceRegisterReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Invoice register report retrieved successfully", result);
});

export const getArAgeingReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getArAgeingReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "AR Ageing report retrieved successfully", result);
});

export const getPaymentReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getPaymentReport(
    clientId,
    page,
    limit,
    locationId
  );

  return SuccessResponse(res, 200, "Payment report retrieved successfully", result);
});

export const getCustomerMasterReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getCustomerMasterReport(
    clientId,
    page,
    limit
  );

  return SuccessResponse(res, 200, "Customer Master report retrieved successfully", result);
});

export const getSupplierMasterReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getSupplierMasterReport(
    clientId,
    page,
    limit
  );

  return SuccessResponse(res, 200, "Supplier Master report retrieved successfully", result);
});

export const getFabricatorMasterReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const clientId = req.user?.clientId as number;

  const result = await reportService.getFabricatorMasterReport(
    clientId,
    page,
    limit
  );

  return SuccessResponse(res, 200, "Fabricator Master report retrieved successfully", result);
});
