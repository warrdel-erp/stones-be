import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../helper/appError";
import * as userRepository from "../repositories/user.repository";
import catchAsync from "../helper/asyncCatch";

export interface AuthRequest extends Request {
  user?: { id: number; userid: string; email: string; defaultLocationId: number };
}

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateUser = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Bearer <token>

  if (!token) {
    throw new AppError("Access denied. No token provided.", 401);
  }

  if (!JWT_SECRET) {
    throw new Error("env does not exists.");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];

  req.user = (await userRepository.findUserById(decoded?.id!)) as any;

  next();
});
