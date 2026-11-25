import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as roleService from "../services/role.service";
import { AppError } from "../helper/appError";

export const getRoles = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const roles = await roleService.listRoles(clientId);
  return SuccessResponse(res, 200, "Roles retrieved successfully", roles);
});

export const getRoleById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    throw new AppError("Invalid role ID", 400);
  }
  const role = await roleService.getRole(id);
  return SuccessResponse(res, 200, "Role retrieved successfully", role);
});

export const createRole = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  const role = await roleService.createRole(req.body, clientId);
  return SuccessResponse(res, 201, "Role created successfully", role);
});

export const updateRole = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    throw new AppError("Invalid role ID", 400);
  }
  const role = await roleService.updateRole(id, req.body);
  return SuccessResponse(res, 200, "Role updated successfully", role);
});

export const deleteRole = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    throw new AppError("Invalid role ID", 400);
  }
  await roleService.deleteRole(id);
  return SuccessResponse(res, 200, "Role deleted successfully", null);
});
