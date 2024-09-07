import jwt from "jsonwebtoken";
import { secretKey } from "../constant.js";
import * as userRepository from "../repository/userRepository.js";

const tokenExpiryTime = '60000000';

async function verifyAndExtendToken(token) {
  const decoded = jwt.verify(token, secretKey);

  if (!decoded) {
    throw new Error("Invalid token");
  }

  const { email, clientId } = decoded;
  const user = await userRepository.findEmailByEmail(email);

  if (!user) {
    throw new Error("Invalid token");
  }

  const newToken = jwt.sign({ email: user.email, clientId }, secretKey, { expiresIn: tokenExpiryTime });

  return { user, clientId, newToken };
}

export async function userAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized token" });
    }

    const requestClientId = req.query.clientId;

    const token = authHeader.split(" ")[1];

    const { user, newToken, clientId } = await verifyAndExtendToken(token);
    

    if (requestClientId === undefined) {
     
      req.user = user;
      req.clientId = clientId;
      res.setHeader('Authorization', `Bearer ${newToken}`);
      return next();
    }

    if (String(requestClientId) !== String(clientId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = user;
    req.clientId = clientId;
    res.setHeader('Authorization', `Bearer ${newToken}`);

    next();
  } catch (error) {
    console.error("Error in verify User:", error);
    return res.status(401).json({ message: "Unauthorized user" });
  }
}

