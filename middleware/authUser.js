import jwt from "jsonwebtoken";
import { permissionMap, secretKey } from "../constant.js";
import * as userRepository from "../repository/userRepository.js";
import { getUserPermissions } from "../repository/rolePermissionRepository.js";

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

    const userEmail = user.dataValues.email;
    const userHasPermissions = await getUserPermissions(userEmail);

    let userPermissionsArray = [];

    userHasPermissions.UserRole.forEach(role => {
      role.role.role_permissions.forEach(rolePermission => {
        if (rolePermission.permission) {
          userPermissionsArray.push(rolePermission.permission.name);
        }
      });
    });

    const reqUrl = req.originalUrl.split('?')[0].endsWith('/')
      ? req.originalUrl.slice(0, -1)
      : req.originalUrl.split('?')[0];

    const requiredPermissions = permissionMap[reqUrl] || [];
    console.log(`>>>>>>>>requiredPermissions>>>`, requiredPermissions);

    const hasRequiredPermissions = requiredPermissions.every(permission =>
      userPermissionsArray.includes(permission)
    );
    console.log(`>>>>>>>>hasRequiredPermissions>>>`, hasRequiredPermissions);

    if (!hasRequiredPermissions) {
      return res.status(403).json({
        status: 403,
        message: "Forbidden: Insufficient permissions",
      });
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