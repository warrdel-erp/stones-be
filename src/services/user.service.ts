import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/user.repository";
import { checkClientExists, findClientByEmail } from "../repositories/client.repository";
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

// Authenticate user
const authenticateUser = async (email: string, password: string) => {
  const user: any = await userRepository.getUserByEmail(email);
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  if (!process.env.JWT_SECRET) {
    throw new Error("env does not exists.");
  }

  const token = jwt.sign(
    {
      id: user.id,
      userid: user.userid,
      email: user.email,
      clientId: user.client?.id,
      accountType: "user"
    },
    process.env.JWT_SECRET
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      clientId: user.client?.id,
      accountType: "user"
    }
  };
};

// Authenticate client
const authenticateClient = async (email: string, password: string) => {
  const client: any = await findClientByEmail(email);
  if (!client) return null;

  const isMatch = await bcrypt.compare(password, client.password);
  if (!isMatch) return null;

  if (!process.env.JWT_SECRET) {
    throw new Error("env does not exists.");
  }

  const token = jwt.sign(
    {
      id: client.id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      clientId: client.id,
      accountType: "client"
    },
    process.env.JWT_SECRET
  );

  return {
    token,
    user: {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      accountType: "client"
    }
  };
};

// Login User or Client
export const loginUser = async (email: string, password: string) => {
  // Try to authenticate as user first
  const userResult = await authenticateUser(email, password);
  if (userResult) {
    return userResult;
  }

  // If not a user, try to authenticate as client
  const clientResult = await authenticateClient(email, password);
  if (clientResult) {
    return clientResult;
  }

  // If neither authentication succeeded
  throw new AppError("Invalid credentials", 401);
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

// Ger user locations
// Update User
export const userLocations = async (id: number) => {
  const userLocations = await userRepository.getUserLocations(id);
  return userLocations;
};

export const assignDefaultLocation = async (userId: number, locationId: number) => {
  // Check if user exists
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 400);
  }

  const userHaveLocation = await userRepository.doesUserHaveLocation(locationId, userId);

  if (!userHaveLocation) {
    throw new AppError("User does not have access to this location", 400);
  }

  // Update default location
  const [updated] = await userRepository.updateUserDefaultLocation(userId, locationId);

  if (!updated) {
    throw new AppError("Failed to update default location", 400);
  }
  return updated;
};

// Fetch User by ID.
export const fetchUserById = async (userId: number) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 400);
  }
  return user;
};

// Check if user has access to given location.
export const checkUserLocationAccess = async (locationId: number, userId: number) => {
  const userHasLocation = await userRepository.doesUserHaveLocation(Number(locationId), userId!);
  if (!userHasLocation) throw new AppError("User does not have access to given location", 400);
};

// Get user profile
export const getUserProfile = async (userId: number) => {
  const user = (await userRepository.findUserById(userId))?.get({ plain: true });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return { ...user, userType: 'user' };
};
