import { Op, Transaction, Model } from "sequelize";
import { Client } from "../models";
import ClientModel from "../models/client.model";
import { Location } from "../models";
import { scoped } from "../utils/scoped";

interface ClientCreateData {
  firstName: string;
  lastName: string;
  phone: string;
  accountId: number;
}

type ClientAttributes = {
  firstName: string;
  lastName: string;
  phone: string;
  accountId: number;
};

export async function findClientByEmail(email: string) {
  return await scoped(Client).findOne({ where: { email } });
}

export async function createClient(clientData: ClientAttributes, transaction?: Transaction) {
  return await scoped(Client).create(clientData as any, { transaction });
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
  const { rows: clients, count: total } = await scoped(Client).findAndCountAll({
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
  const [updatedRows] = await scoped(Client).update(updateData, { where: { id } });

  // If update was successful, return the updated client
  return updatedRows ? await Client.findByPk(id) : null;
};

/**
 * Get a client by ID
 */
export const getClientById = async (clientId: number, options?: any) => {
  return await Client.findByPk(clientId, {
    include: [
      {
        association: 'users',
        include: [
          {
            association: 'account',
            attributes: { exclude: ['password'] }
          }
        ]
      },
      {
        association: 'company'
      },
      {
        association: 'account',
        attributes: { exclude: ['password'] }

      }
    ],
    ...options
  });
};

/**
 * Get a client by ID
 */
export const getClientByIdSimple = async (clientId: number, options?: any) => {
  return await Client.findByPk(clientId, {
    include: [
      {
        association: 'company'
      },
      {
        association: 'account',
        attributes: { exclude: ['password'] }

      }
    ],
    ...options,
  });
};

/**
 * Get all locations associated with a client
 */
export const getClientLocations = async (clientId: number) => {
  let client: any = await Client.findByPk(clientId, {
    include: [{
      model: Location,
      as: "locations"
    }]
  });

  if (!client) {
    return null;
  }

  client = client.get({ plain: true })

  return client.locations;
};

/**
 * Update client's default location.
 */
export const updateClientDefaultLocation = async (clientId: number, locationId: number) => {
  return await scoped(Client).update({ defaultLocationId: locationId }, { where: { id: clientId } });
};

/**
 * Check if client has access to given location.
 */
export const doesClientHaveLocation = async (locationId: number, clientId: number) => {
  const location = await Location.findOne({
    where: { id: locationId, clientId: clientId }
  });

  return !!location;
};
