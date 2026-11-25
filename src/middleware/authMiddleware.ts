import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../helper/appError";
import * as userRepository from "../repositories/user.repository";
import * as clientRepository from "../repositories/client.repository";
import catchAsync from "../helper/asyncCatch";
import { requestContext } from "../utils/requestContext";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    userid?: string;
    email: string;
    defaultLocationId?: number;
    clientId: number;
    companyId?: number;
    firstName?: string;
    lastName?: string;
    accountType: "user" | "client";
    accountId: number;
    role?: string;
    roleId?: number;
    locationScope?: "location" | "company";
    permissions?: string[];
  };
}

const JWT_SECRET = process.env.JWT_SECRET;

// Authenticate a user
const authenticateUserFromToken = async (decoded: any, req: AuthRequest) => {
  if (decoded.accountType !== "user") return false;

  const user: any = await userRepository.findUserById(decoded.id);
  if (!user) return false;

  const permissions = user.userRole?.permissions?.map((p: any) => p.permission) || [];

  req.user = {
    id: user.id,
    userid: user.userid,
    email: user.account?.email || decoded.email,
    defaultLocationId: user.defaultLocationId,
    clientId: user.clientId || user.companyId,
    companyId: user.companyId || user.clientId,
    accountType: "user",
    accountId: user.accountId,
    role: user.userRole?.name || user.role,
    roleId: user.roleId,
    locationScope: user.locationScope || "location",
    permissions,
  };

  return true;
};

// Authenticate a client (backward compatibility)
const authenticateClientFromToken = async (decoded: any, req: AuthRequest) => {
  if (decoded.accountType !== "client") return false;

  const client: any = await clientRepository.checkClientExists(decoded.id);
  if (!client) return false;

  const user: any = await userRepository.findUserByAccountId(client.accountId);
  const permissions = user?.userRole?.permissions?.map((p: any) => p.permission) || [];

  req.user = {
    id: user ? user.id : client.id,
    clientId: client.id,
    companyId: client.id,
    email: client.email,
    firstName: client.firstName,
    lastName: client.lastName,
    accountType: "client",
    accountId: client.accountId,
    defaultLocationId: user?.defaultLocationId || client.defaultLocationId,
    role: user?.userRole?.name || "Company Admin",
    roleId: user?.roleId,
    locationScope: user?.locationScope || "company",
    permissions,
  };

  return true;
};

export const authenticateUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Bearer <token>

  if (!token) {
    throw new AppError("Access denied. No token provided.", 401);
  }

  if (!JWT_SECRET) {
    throw new Error("env does not exists.");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as any;

  if (!decoded) {
    throw new AppError("Invalid token", 401);
  }

  // Try to authenticate as a user
  const userAuthenticated = await authenticateUserFromToken(decoded, req);
  if (userAuthenticated) {
    requestContext.run(
      {
        clientId: req.user?.clientId,
        companyId: req.user?.companyId || req.user?.clientId,
        locationId: req.user?.defaultLocationId,
        accountId: req.user?.accountId,
        locationScope: req.user?.locationScope || "location",
        roleId: req.user?.roleId,
      },
      () => {
        next();
      }
    );
    return;
  }

  // If not a user, try as a client
  const clientAuthenticated = await authenticateClientFromToken(decoded, req);
  if (clientAuthenticated) {
    requestContext.run(
      {
        clientId: req.user?.clientId,
        companyId: req.user?.companyId || req.user?.clientId,
        locationId: req.user?.defaultLocationId,
        accountId: req.user?.accountId,
        locationScope: req.user?.locationScope || "company",
        roleId: req.user?.roleId,
      },
      () => {
        next();
      }
    );
    return;
  }

  // If neither authentication succeeded
  throw new AppError("Invalid account type or user not found", 401);
});
