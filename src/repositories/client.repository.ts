import { Client } from "../models";

export async function findClientByEmail(email: string) {
  return await Client.findOne({ where: { email } });
}

export async function createClient(clientData: Partial<typeof Client>) {
  return await Client.create(clientData);
}

export const checkClientExists = async (clientId: number) => {
  return await Client.findByPk(clientId);
};
