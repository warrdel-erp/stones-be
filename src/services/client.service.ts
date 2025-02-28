import bcrypt from "bcryptjs";
import { AppError } from "../helper/appError";
import {
  createClient,
  findClientByEmail,
} from "../repositories/client.repository";

export async function registerClient(clientData: any) {
  const { email, password } = clientData;

  // Check if client exists
  const existingClient = await findClientByEmail(email);
  if (existingClient) {
    throw new AppError("Client already exists", 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create client
  return await createClient({ ...clientData, password: hashedPassword });
}
