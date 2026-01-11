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
    firstName?: string;
    lastName?: string;
    accountType: "user" | "client";
    accountId: number;
  };
}

const JWT_SECRET = process.env.JWT_SECRET;

// Authenticate a user
const authenticateUserFromToken = async (decoded: any, req: AuthRequest) => {
  if (decoded.accountType !== "user") return false;

  const user: any = await userRepository.findUserById(decoded.id);
  if (!user) return false;

  req.user = {
    id: user.id,
    userid: user.userid,
    email: user.email,
    defaultLocationId: user.defaultLocationId,
    clientId: user.clientId,
    accountType: "user",
    accountId: user.accountId
  };

  return true;
};

// Authenticate a client
const authenticateClientFromToken = async (decoded: any, req: AuthRequest) => {
  if (decoded.accountType !== "client") return false;

  const client: any = await clientRepository.checkClientExists(decoded.id);
  if (!client) return false;

  req.user = {
    id: client.id,
    clientId: client.id,
    email: client.email,
    firstName: client.firstName,
    lastName: client.lastName,
    accountType: "client",
    accountId: client.accountId,
    defaultLocationId: client.defaultLocationId
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
        locationId: req.user?.defaultLocationId,
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
        locationId: req.user?.defaultLocationId,
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
