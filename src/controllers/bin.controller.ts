import { Request, Response } from "express";
import * as binService from "../services/bin.service";
import { SuccessResponse } from "../helper/response";

export async function getBinsByLocationController(req: Request, res: Response) {
  const { locationId } = req.params;
  const bins = await binService.getBinsByLocation(Number(locationId));
  SuccessResponse(res, 200, "Bin list according to location fetched", bins);
}
