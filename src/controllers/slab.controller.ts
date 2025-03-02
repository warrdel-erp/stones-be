import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as slabService from "../services/slab.service";

export const updateSlabHoldStatus = catchAsync(async (req: Request, res: Response) => {
  const { slabId } = req.params;
  const { isHold } = req.body;

  if (typeof isHold !== "boolean") {
    return res.status(400).json({ error: "`isHold` must be true or false" });
  }

  const result = await slabService.updateSlabHoldStatus(Number(slabId), isHold);
  return res.json(result);
});
