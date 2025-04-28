import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as generalService from "../services/general.service";

export const getGeneralData = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;

  const data = await generalService.getGeneralData(Number(clientId));

  SuccessResponse(res, 200, "Fetch general data successfully", data);
});
