import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import * as opportunityService from "../services/opportunity.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

export const createOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const createdById = req.user?.id || req.user?.accountId;
  const payload = {
    ...req.body,
    clientId,
    createdById,
  };
  const opportunity = await opportunityService.create(payload);
  SuccessResponse(res, 201, "Opportunity created successfully", opportunity);
});

export const getAllOpportunities = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = req.query.search as string;
  const status = req.query.status as string;
  const tab = req.query.tab as string;

  const filter: any = {};
  if (status) filter.status = status;
  if (tab && tab !== "") filter.status = tab;

  const result = await opportunityService.getAll(clientId, page, limit, search, filter);
  SuccessResponse(res, 200, "Opportunities fetched successfully", result);
});

export const getOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunity = await opportunityService.getOne(+req.params.id, clientId);
  SuccessResponse(res, 200, "Opportunity details fetched successfully", opportunity);
});

export const updateOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunity = await opportunityService.update(+req.params.id, clientId, req.body);
  SuccessResponse(res, 200, "Opportunity updated successfully", opportunity);
});

export const deleteOpportunity = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  await opportunityService.remove(+req.params.id, clientId);
  SuccessResponse(res, 200, "Opportunity deleted successfully", {});
});

export const addRequirementLine = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const locationId = Number(req.user?.defaultLocationId);
  const opportunityId = Number(req.params.id);
  const { requirements } = await opportunityService.addRequirement(opportunityId, clientId, req.body, locationId);
  SuccessResponse(res, 201, "✨ Requirement line added & AI auto-allocated inventory!", requirements);
});

export const getRequirementsAndAllocations = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const requirements = await opportunityService.getRequirementsAndAllocations(opportunityId, clientId);
  SuccessResponse(res, 200, "Requirements fetched", requirements);
});

export const updateRequirementAllocations = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const requirementId = Number(req.params.reqId);
  const { inventoryProductIds } = req.body;
  const updatedRequirements = await opportunityService.updateRequirementAllocations(
    opportunityId,
    requirementId,
    clientId,
    inventoryProductIds || []
  );
  SuccessResponse(res, 200, "Requirement allocations updated successfully", updatedRequirements);
});

export const deleteRequirementLine = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const requirementId = Number(req.params.reqId);
  await opportunityService.removeRequirement(requirementId, clientId);
  SuccessResponse(res, 200, "Requirement line deleted", {});
});

export const getOpportunityHold = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = Number(req.user?.clientId);
  const opportunityId = Number(req.params.id);
  const hold = await opportunityService.getHold(opportunityId, clientId);
  SuccessResponse(res, 200, "Opportunity hold fetched successfully", hold);
});
