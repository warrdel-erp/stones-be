import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import * as quotationService from "../services/quotation.service";

export const getQuotations = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const quotations = await quotationService.getQuotations(opportunityId, clientId);
  SuccessResponse(res, 200, "Quotations fetched successfully", quotations);
});

export const getQuotation = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const quotationId = Number(req.params.quoteId);
  const quotation = await quotationService.getQuotation(quotationId, clientId);
  SuccessResponse(res, 200, "Quotation details fetched successfully", quotation);
});

export const createQuotation = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const quotation = await quotationService.createQuotation(opportunityId, clientId, req.body);
  SuccessResponse(res, 201, "Quotation created successfully", quotation);
});

export const publishQuotation = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const accountId = Number(req.user?.accountId);
  const opportunityId = Number(req.params.id);
  const quotationId = Number(req.params.quoteId);
  const { syncHold, addProductsToHold, locationId, removeProductsFromHold, rates } = req.body;
  const quotation = await quotationService.publishQuotation(opportunityId, quotationId, clientId, accountId, syncHold, addProductsToHold, locationId, removeProductsFromHold, rates);
  SuccessResponse(res, 200, "Quotation published successfully", quotation);
});
export const updateQuotationRates = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const quotationId = Number(req.params.quoteId);
  const { rates } = req.body;
  const quotation = await quotationService.updateQuotationRates(opportunityId, quotationId, clientId, rates);
  SuccessResponse(res, 200, "Quotation rates updated successfully", quotation);
});

export const addQuotationProducts = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const quotationId = Number(req.params.quoteId);
  const { inventoryProductIds } = req.body;
  const quotation = await quotationService.addQuotationProducts(opportunityId, quotationId, clientId, inventoryProductIds);
  SuccessResponse(res, 200, "Products added to quotation successfully", quotation);
});

export const removeQuotationProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const quotationId = Number(req.params.quoteId);
  const invProductId = Number(req.params.invProductId);
  const quotation = await quotationService.removeQuotationProduct(opportunityId, quotationId, clientId, invProductId);
  SuccessResponse(res, 200, "Product removed from quotation successfully", quotation);
});

export const createSalesOrderFromQuotation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id: opportunityId, quoteId } = req.params;
  const clientId = Number(req.user?.clientId);
  const accountId = Number(req.user?.accountId);
  const { shippingAddressId } = req.body;

  const salesOrder = await quotationService.createSalesOrderFromQuotation(
    Number(opportunityId),
    Number(quoteId),
    clientId,
    accountId,
    shippingAddressId ? Number(shippingAddressId) : undefined
  );
  SuccessResponse(res, 201, "Sales Order created successfully", salesOrder);
});
