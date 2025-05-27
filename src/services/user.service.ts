import bcrypt from "bcryptjs";
import * as userRepository from "../repositories/user.repository";
import { findClientByEmail } from "../repositories/client.repository";
import { AppError } from "../helper/appError";
import jwt from "jsonwebtoken";
import * as accountService from "./account.service";
import { sequelize } from "../config/database";
import * as clientRepository from "../repositories/client.repository";

type UserRegistrationData = {
  username: string;
  userid: string;
  password: string;
  phone: string;
  email: string;
  clientId: number;
};

// Register User
export const registerUser = async (userData: UserRegistrationData) => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Validate client exists
    const client = await clientRepository.checkClientExists(userData.clientId);
    if (!client) {
      throw new AppError("Client not found", 404);
    }

    // Extract account data
    const { email, password } = userData;

    // Create account (account service handles its own transaction)
    const account = await accountService.createAccount({ email, password }, transaction);

    // Create user with account reference within transaction
    const user = await userRepository.createUser({
      username: userData.username,
      userid: userData.userid,
      phone: userData.phone,
      clientId: userData.clientId,
      accountId: account.getDataValue('id')
    }, transaction);

    // If everything is successful, commit the transaction
    await transaction.commit();

    return user;
  } catch (error) {
    // If any error occurs, rollback the transaction
    await transaction.rollback();
    throw error;
  }
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

  // Convert to plain object and format the response
  const userData = user.get({ plain: true });

  // Ensure we have a clean response structure
  return {
    ...userData,
    client: userData.client ? {
      ...userData.client,
      company: userData.client.company || null
    } : null
  };
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

// Get Users by Client ID
export const getUsersByClientId = async (clientId: number) => {
  const users = await userRepository.getUsersByClientId(clientId);
  if (!users) {
    throw new AppError("No users found for this client", 404);
  }
  return users;
};
