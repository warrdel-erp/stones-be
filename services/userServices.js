import * as registerRepository from "../repository/userRepository.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
var salt = bcrypt.genSaltSync(10);

//register
export async function register(info) {
  let { username, password, phone, email } = info;
  password = await bcrypt.hashSync(password, salt);

  const data = {
    username,
    password,
    phone,
    email : email.toLowerCase(),
    userid: uuidv4(),
  };

  return await registerRepository.register(data);
}

// login 

export async function login(info){
    return await registerRepository.register(info);
}
