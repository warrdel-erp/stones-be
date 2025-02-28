import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../helper/appError";

export interface AuthRequest extends Request {
  user?: { id: number; userid: string; email: string };
}

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from Bearer <token>

  if (!token) {
    throw new AppError("Access denied. No token provided.", 401);
  }

  if (!JWT_SECRET) {
    throw new Error("env does not exists.");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];

  req.user = decoded;
  next();
};
