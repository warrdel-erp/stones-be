import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as generalService from "../services/general.service";
import { SuccessResponse } from "../helper/response";

export const getGeneralData = catchAsync(async (req: Request, res: Response) => {
  const data = await generalService.getGeneralData();

  SuccessResponse(res, 200, "Fetch general data successfully", data);
});
