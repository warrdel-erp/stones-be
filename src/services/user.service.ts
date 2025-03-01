import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/user.repository";
import { checkClientExists } from "../repositories/client.repository";
import { AppError } from "../helper/appError";
import jwt from "jsonwebtoken";

// Register User
export const registerUser = async (userData: {
  username: string;
  userid: string;
  password: string;
  phone: string;
  email: string;
  clientId: number;
}) => {
  // Check if email already exists
  const existingEmail = await userRepository.getUserByEmail(userData.email);
  if (existingEmail) {
    throw new Error("Email already in use.");
  }

  // Check if userid is already taken
  const existingUserId = await userRepository.getUserByUserId(userData.userid);
  if (existingUserId) {
    throw new Error("User ID already taken.");
  }

  // Check if client exists
  const clientExists = await checkClientExists(userData.clientId);
  if (!clientExists) {
    throw new AppError("Client not found.", 401);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create user
  return await userRepository.createUser({ ...userData, password: hashedPassword });
};

/**
 * Assigns a location to a user after validation.
 */
export const assignLocationToUser = async (userId: number, locationId: number) => {
  if (!userId || !locationId) {
    throw new Error("User ID and Location ID are required");
  }

  const result = await userRepository.addUserLocation(userId, locationId);
  if (!result) {
    throw new Error("User or Location not found");
  }

  return result;
};

// Login User
export const loginUser = async (email: string, password: string) => {
  const user: any = await userRepository.getUserByEmail(email);
  if (!user) throw new AppError("Invalid credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  if (!process.env.JWT_SECRET) {
    throw new Error("env does not exists.");
  }

  const token = jwt.sign(
    { id: user.id, userid: user.userid, email: user.email, clientId: user.client.id },
    process.env.JWT_SECRET
  );

  return { token, user: { id: user.id, username: user.username, email: user.email, clientId: user.client.id } };
};

// Get all Users.
export const fetchAllUsers = async (page: number, limit: number, search?: string) => {
  return await userRepository.getAllUsers(page, limit, search);
};

// Update User
export const modifyUser = async (id: number, updateData: any) => {
  const updatedUser = await userRepository.updateUser(id, updateData);
  if (!updatedUser) throw new AppError("User not found or update failed", 400);
  return updatedUser;
};
