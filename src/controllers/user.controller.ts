import { NextFunction, Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as userService from "../services/user.service";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";

export const registerUserHandler = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.registerUser(req.body);

  return SuccessResponse(res, 201, "Client registered successfully", user);
});

/**
 * Controller to assign a location to a user.
 */
export const assignLocation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { locationId } = req.body;
  const userId = req.user?.id;

  if (!userId && !locationId) {
    throw new AppError("Location ID and UserID are required", 400);
  }

  const result = await userService.assignLocationToUser(userId!, locationId);

  return SuccessResponse(res, 200, "Location assigned to user successfully", result);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("User ID and password are required", 400);
  }

  const result = await userService.loginUser(email, password);

  SuccessResponse(res, 200, "Login successful", result);
});
