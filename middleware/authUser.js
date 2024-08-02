import jwt from "jsonwebtoken";
import { secretKey } from "../constant.js";
import * as userRepository from "../repository/userRepository.js";

const tokenExpiryTime = '2d';

async function verifyAndExtendToken(token) {
  const decoded = jwt.verify(token, secretKey);

  if (!decoded) {
    throw new Error("Invalid token");
  }

  const { email } = decoded;
  const user = await userRepository.findEmailByEmail(email);

  if (!user) {
    throw new Error("Invalid token");
  }
  
  const newToken = jwt.sign({ email: user.email }, secretKey, { expiresIn: tokenExpiryTime });
  console.log(newToken, 'newtoken');

  return { user, newToken };
}

export async function userAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized token" });
    }

    const token = authHeader.split(" ")[1];

    const { user, newToken } = await verifyAndExtendToken(token);

    req.user = user;
    res.setHeader('Authorization', `Bearer ${newToken}`);

    next();
  } catch (error) {
    console.error("Error in verify User:", error);
    return res.status(401).json({ message: "Unauthorized user" });
  }
}
