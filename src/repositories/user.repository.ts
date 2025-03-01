import { Op } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";

// Create a new user
export const createUser = async (userData: {
  username: string;
  userid: string;
  password: string;
  phone: string;
  email: string;
  clientId: number;
}) => {
  return await models.User.create(userData);
};

// Get User by Email
export const getUserByEmail = async (email: string) => {
  return await models.User.findOne({ where: { email }, include: [{ model: models.Client, as: "client" }] });
};

// Get User by Id
export const getUserByUserId = async (userid: string) => {
  return await models.User.findOne({ where: { userid } });
};

// Adds a location to a user by inserting a record into the user_locations table.
export const addUserLocation = async (userId: number, locationId: number) => {
  const user = await models.User.findByPk(userId);
  const location = await models.Location.findByPk(locationId);

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

  const { rows: users, count: total } = await models.User.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { users, total, page, limit };
};

// Update User
export const updateUser = async (id: number, updateData: any) => {
  const [updatedRows] = await models.User.update(updateData, { where: { id } });

  if (!updatedRows) return null;
  return await models.User.findByPk(id);
};

// get User By userID
export const findUserById = async (userId: number) => {
  return await models.User.findByPk(userId, { attributes: { exclude: ["password"] } });
};

// Get all locations that are assigned to user.
export const getUserLocation = async (id: number) => {
  const user: any = await models.User.findByPk(id, {
    include: [{ model: models.Location, as: "locations" }],
  });

  return user?.locations;
};

// update user's default location.
export const updateUserDefaultLocation = async (userId: number, locationId: number) => {
  return await models.User.update({ defaultLocationId: locationId }, { where: { id: userId } });
};

// Check does user have access to given location
export const doesUserHaveLocation = async (userId: number, locationId: number) => {
  const user = await models.User.findOne({
    where: { id: userId },
    include: {
      model: models.Location,
      as: "locations",
      where: { id: locationId }, // Ensure the location is associated
    },
  });

  return !!user; // Returns true if user is found, otherwise false
};
