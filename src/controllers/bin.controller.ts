import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as binService from "../services/bin.service";
import { checkUserLocationAccess } from "../services/user.service";

export const getBinsByLocationController = catchAsync(async (req: AuthRequest, res: Response) => {
  const { locationId } = req.params;
  const userId = req.user?.id;

  // Check if user has access to this location.
  await checkUserLocationAccess(Number(locationId), userId!);

  const bins = await binService.getBinsByLocation(Number(locationId));
  SuccessResponse(res, 200, "Bin list according to location fetched", bins);
});
