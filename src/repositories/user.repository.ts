import { sequelize } from "../config/database";
import { Location, User } from "../models";

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
  return await User.findOne({ where: { email } });
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
