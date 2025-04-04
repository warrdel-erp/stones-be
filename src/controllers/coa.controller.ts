import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as coaService from "../services/coa.service";
import { SuccessResponse } from "../helper/response";

export const getCoaData = catchAsync(async (req: Request, res: Response) => {

  const { nested } = req.query

  let data;
  if (!!Number(nested)) {
    data = coaService.buildNestedCOA();
  } else {
    data = coaService.getCoaData();
  }

  SuccessResponse(res, 200, "Accounts data fetched successfully", data);
});
