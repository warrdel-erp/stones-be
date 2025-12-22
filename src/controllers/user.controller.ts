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

/**
 * Get all users with pagination
 */
export const getAllUsersController = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;

  const result = await userService.fetchAllUsers(page, limit, search);

  SuccessResponse(res, 200, "Users retrieved successfully", result.users, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const updateUserController = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedUser = await userService.modifyUser(Number(id), updateData);

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return SuccessResponse(res, 200, "Vendor updated successfully", updatedUser);
});

// Get Locations for user
export const getUserLocations = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.user?.id;

  const userLocations = await userService.userLocations(id!);
  return SuccessResponse(res, 200, "User locations fetched successfully", userLocations);
});

// Set Default location for user
export const setDefaultLocation = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { locationId } = req.body;

  if (!locationId) {
    throw new AppError("Location ID is required", 400);
  }

  const response = await userService.assignDefaultLocation(userId!, locationId);

  return SuccessResponse(res, 200, "Default location updated successfully", response);
});

// Fetch user by ID
export const getUser = catchAsync(async (req: Request, res: Response) => {
  const userId = Number(req.params.id); // Convert ID to number

  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const user = await userService.fetchUserById(userId);
  return res.json(user);
});

// Get all users for the client of the requesting user
export const getClientUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }

  const users = await userService.getUsersByClientId(req.user.clientId);
  return SuccessResponse(res, 200, "Users retrieved successfully", users);
});

// Create User by Authenticated Account
export const createUserByAccountController = catchAsync(async (req: AuthRequest, res: Response) => {
  const accountId = req.user?.accountId;
  const clientId = req.user?.clientId;

  if (!accountId || !clientId) {
    throw new AppError("User not authenticated", 401);
  }

  const { username, userid, email, password, phone, defaultLocationId } = req.body;

  const user = await userService.createUserByAccount(
    {
      username,
      userid,
      email,
      password,
      phone,
      clientId,
      defaultLocationId,
    },
    accountId
  );

  return SuccessResponse(res, 201, "User created successfully", user);
});
