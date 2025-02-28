import { NextFunction, Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { registerClient } from "../services/client.service";
import { SuccessResponse } from "../helper/response";

export const registerClientHandler = catchAsync(async (req: Request, res: Response) => {
  const client = await registerClient(req.body);

  SuccessResponse(res, 201, "Client registered successfully", client);
});
