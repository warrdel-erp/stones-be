import { Response } from "express";
import asyncCatch from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as docNumberingService from "../services/documentNumbering.service";
import { DOCUMENT_NUMBERING_TYPE } from "../models/documentNumberingConfig.model";

export const getDocumentNumberingConfigs = asyncCatch(async (req: AuthRequest, res: Response) => {
  const clientId = req.user!.clientId;
  const data = await docNumberingService.getDocumentNumberingConfigs(clientId);
  return SuccessResponse(res, 200, "Document numbering configurations fetched successfully", data);
});

export const updateDocumentNumberingConfig = asyncCatch(async (req: AuthRequest, res: Response) => {
  const clientId = req.user!.clientId;
  const documentType = req.params.documentType as DOCUMENT_NUMBERING_TYPE;
  const data = await docNumberingService.updateDocumentNumberingConfig(clientId, documentType, req.body);
  return SuccessResponse(res, 200, "Document numbering configuration updated successfully", data);
});
