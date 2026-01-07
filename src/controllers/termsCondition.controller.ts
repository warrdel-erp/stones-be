import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as termsConditionService from "../services/termsCondition.service";

// Create terms condition.
export const createTermsCondition = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = {
    ...req.body,
    clientId: clientId || req.body.clientId,
  };

  const termsCondition = await termsConditionService.createTermsCondition(data);
  return SuccessResponse(res, 201, "Terms and conditions created successfully", termsCondition);
});

// Get terms condition by client ID.
export const getTermsConditionByClientId = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  if (!clientId) {
    return res.status(400).json({ error: "Client ID is required" });
  }

  const termsCondition = await termsConditionService.getTermsConditionByClientId(Number(clientId));
  return SuccessResponse(res, 200, "Terms and conditions fetched successfully", termsCondition);
});

// Update terms condition by ID.
export const updateTermsCondition = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const updatedTermsCondition = await termsConditionService.updateTermsCondition(Number(id), req.body);
  return SuccessResponse(res, 200, "Terms and conditions updated successfully", updatedTermsCondition);
});


