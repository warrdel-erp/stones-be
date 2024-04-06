import jwt from "jsonwebtoken";
import { secretKey } from "../constant.js";
import * as userRepository from "../repository/userRepository.js";

export async function userAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    console.log("authHeader>>>>",authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized token" });
    }

    const token = authHeader.split(" ")[1];
    console.log("token>>>>>>",token);

    const decoded = jwt.verify(token, secretKey);
    console.log("decoded>>>>>>",decoded);

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
