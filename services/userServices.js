import * as registerRepository from "../repository/userRepository.js";
import * as clientUserRepository from "../repository/clientUserRepository.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
var salt = bcrypt.genSaltSync(10);

//register
export async function register(info) {
  try {
    const { username, password, phone, email, clientId } = info;
    const hashedPassword = await bcrypt.hash(password, salt);
    const userData = {
      username,
      password: hashedPassword,
      phone,
      email: email.toLowerCase(),
      userid: uuidv4(),
    };
    const user = await registerRepository.register(userData);
    const userClientData = {
      clientId,
      userId: user.dataValues.id,
    };
    const clientUserCreate = await clientUserRepository.register(userClientData);
    return { user, clientUserCreate };

  } catch (error) {

    console.error("Error during registration:", error);
    throw error
  }
}



// login 

export async function login(info) {
  return await registerRepository.register(info);
}
