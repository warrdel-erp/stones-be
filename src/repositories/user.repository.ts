import { Op, Transaction, Model } from "sequelize";
import { sequelize } from "../config/database";
import * as models from "../models";
import User from "../models/user.model";
import { scoped } from "../utils/scoped";

type UserAttributes = {
  username: string;
  userid: string;
  phone: string;
  clientId: number;
  accountId: number;
};

// Create a new user
export const createUser = async (userData: UserAttributes, transaction?: Transaction) => {
  return await scoped(models.User).create(userData as any, { transaction });
};

// Get User by Email
export const getUserByEmail = async (email: string) => {
  return await scoped(models.User).findOne({ where: { email }, include: [{ model: models.Client, as: "client" }] });
};

// Get User by Id
export const getUserByUserId = async (userid: string) => {
  return await scoped(models.User).findOne({ where: { userid } });
};

// Get User by Phone
export const getUserByPhone = async (phone: string) => {
  return await scoped(models.User).findOne({ where: { phone } });
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
// Adds a location to a user by inserting a record into the user_locations table.
export const removeUserLocation = async (userId: number, locationId: number) => {
  const user = await models.User.findByPk(userId);
  const location = await models.Location.findByPk(locationId);

  if (!user || !location) {
    return null; // Handle in service layer
  }

  await sequelize.models.user_locations.destroy({
    where: {
      userId: userId,
      locationId: locationId,
    }
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

  const { rows: users, count: total } = await scoped(models.User).findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { users, total, page, limit };
};

// Update User
export const updateUser = async (id: number, updateData: any) => {
  const [updatedRows] = await scoped(models.User).update(updateData, { where: { id } });

  if (!updatedRows) return null;
  return await models.User.findByPk(id);
};

// get User By userID
export const findUserById = async (userId: number) => {
  return await models.User.findByPk(userId, {
    attributes: { exclude: ["password"] },
    include: [
      {
        model: models.Client,
        as: "client",
        include: [
          {
            model: models.Company,
            as: "company"
          }
        ]
      },
      {
        model: models.Account,
        as: "account",
        attributes: ['email']
      }
    ]
  });
};

// Get all locations that are assigned to user.
export const getUserLocations = async (id: number) => {
  const user: any = await models.User.findByPk(id, {
    include: [{ model: models.Location, as: "locations" }],
  });

  return user?.locations;
};

// update user's default location.
export const updateUserDefaultLocation = async (userId: number, locationId: number) => {
  return await scoped(models.User).update({ defaultLocationId: locationId }, { where: { id: userId } });
};

// Check does user have access to given location
export const doesUserHaveLocation = async (locationId: number, userId: number) => {
  const user = await models.User.findByPk(userId, {
    include: {
      model: models.Location,
      as: "locations",
      where: { id: locationId }, // Ensure the location is associated
    },
  });

  return !!user; // Returns true if user is found, otherwise false
};

// Get Users by Client ID
export const getUsersByClientId = async (clientId: number) => {
  return await scoped(models.User).findAll({
    where: { clientId },
    attributes: { exclude: ['password'] },
    include: [
      { model: models.Account, attributes: ['email'], as: "account" },
    ]
  });
};


export const countUsersByClientId = async (
  clientId: number,
  transaction?: any
) => {
  return await models.User.count({
    where: { clientId },
    transaction,
  });
};