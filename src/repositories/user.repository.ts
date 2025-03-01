import { Model, Op } from "sequelize";
import { sequelize } from "../config/database";
import { Client, Location, User } from "../models";

export const createUser = async (userData: {
  username: string;
  userid: string;
  password: string;
  phone: string;
  email: string;
  clientId: number;
}) => {
  return await User.create(userData);
};

export const getUserByEmail = async (email: string) => {
  return await User.findOne({ where: { email }, include: [{ model: Client, as: "client" }] });
};

export const getUserByUserId = async (userid: string) => {
  return await User.findOne({ where: { userid } });
};

/**
 * Adds a location to a user by inserting a record into the user_locations table.
 */
export const addUserLocation = async (userId: number, locationId: number) => {
  const user = await User.findByPk(userId);
  const location = await Location.findByPk(locationId);

  if (!user || !location) {
    return null; // Handle in service layer
  }

  await sequelize.models.user_locations.create({
    userId: userId,
    locationId: locationId,
  });

  // await User.add; // Sequelize auto-generated method
  return { userId, locationId };
};

// Get All users
export const getAllUsers = async (page: number, limit: number, search?: string) => {
  const offset = (page - 1) * limit;

  const whereClause = search
    ? {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  const { rows: users, count: total } = await User.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { users, total, page, limit };
};

// Update User
export const updateUser = async (id: number, updateData: Partial<typeof User>) => {
  const [updatedRows] = await User.update(updateData, { where: { id } });

  if (!updatedRows) return null;
  return await User.findByPk(id);
};
