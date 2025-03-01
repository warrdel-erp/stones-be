import bcrypt from "bcryptjs";
import { AppError } from "../helper/appError";
import * as clientRepository from "../repositories/client.repository";

/**
 * Register Client
 */
export async function registerClient(clientData: any) {
  const { email, password } = clientData;

  // Check if client exists
  const existingClient = await clientRepository.findClientByEmail(email);
  if (existingClient) {
    throw new AppError("Client already exists", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create client
  return await clientRepository.createClient({ ...clientData, password: hashedPassword });
}

/**
 * Service to fetch all clients with pagination and optional search.
 */
export const fetchAllClients = async (page: number, limit: number, search?: string) => {
  return clientRepository.getAllClients(page, limit, search);
};

/**
 * Service to update a client by ID.
 */
export const modifyClient = async (id: number, updateData: any) => {
  const updatedClient = await clientRepository.updateClient(id, updateData);
  if (!updatedClient) throw new AppError("User not found or update failed", 400);
  return updatedClient;
};
