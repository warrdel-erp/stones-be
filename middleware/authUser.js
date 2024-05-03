import jwt from "jsonwebtoken";
import { secretKey } from "../constant.js";
import * as userRepository from "../repository/userRepository.js";

export async function userAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, secretKey);

    if(!decoded){
      return res.status(401).json({ message: "Invalid token test" });
    }

    const { email } = decoded;

    const user = await userRepository.findEmailByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Error in verify User:", error);
    return res.status(401).json({ message: "Unauthorized user" });
  }
}
