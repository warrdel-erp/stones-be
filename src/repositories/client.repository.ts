import { Op, Transaction } from "sequelize";
import { Client } from "../models";

export async function findClientByEmail(email: string) {
  return await Client.findOne({ where: { email } });
}

export async function createClient(clientData: Partial<typeof Client>, transaction?: Transaction) {
  return await Client.create(clientData, { transaction });
}

export const checkClientExists = async (clientId: number) => {
  return await Client.findByPk(clientId);
};

/**
 * Fetch all clients with pagination and optional search.
 */
export const getAllClients = async (page: number, limit: number, search?: string) => {
  const offset = (page - 1) * limit;

  // Define search condition if search query is provided
  const whereClause = search
    ? {
      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }],
    }
    : {};

  // Fetch clients along with the total count
  const { rows: clients, count: total } = await Client.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { clients, total, page, limit };
};

/**
 * Update client details by ID.
 */
export const updateClient = async (id: number, updateData: any) => {
  const [updatedRows] = await Client.update(updateData, { where: { id } });

  // If update was successful, return the updated client
  return updatedRows ? await Client.findByPk(id) : null;
};
