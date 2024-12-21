import * as userService from "../services/userServices.js";
import * as userRepository from "../repository/userRepository.js";
import * as clientUserRepository from '../repository/clientUserRepository.js'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { secretKey } from '../constant.js'
import { getUserPermissions } from "../repository/rolePermissionRepository.js";

// register
export const register = async (req, res) => {
  try {
    const { email, password, username, phone, clientId } = req.body;
    const existingEmail = await userRepository.findEmailByEmail(email);

    // Check if all required fields are provided

    if (!(email && password && username && phone)) {
      res.status(400).send("All input is required");

      // Check if email already exists
    } else if (existingEmail) {
      res.status(400).send("Email already exists");

      // register the user
    } else {
      const result = await userService.register(req.body);
      res.status(200).send(result);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Internal server error");
  }
};

// login

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    const existingEmail = await userRepository.findEmailByEmail(email);
    const userId = existingEmail.dataValues.id;
    const clientIdOfEmail = await clientUserRepository.findClientID(userId);
    const clientId = clientIdOfEmail.dataValues.clientId;
    const location = await clientUserRepository.findClientUserLocation(clientId)
    const userHasPermissions = await getUserPermissions(email);
    let userPermissionsArray = [];

    userHasPermissions.UserRole.forEach(role => {
      role.role.role_permissions.forEach(rolePermission => {
        if (rolePermission.permission) {
          userPermissionsArray.push(rolePermission.permission.name);
        }
      });
    });

    console.log(userPermissionsArray, 'Collected User Permissions');
    if (!existingEmail) {
      return res.status(400).send("Email does not exist");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingEmail.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).send("Incorrect password");
    }

    const token = jwt.sign(
      { email: existingEmail.email, clientId },
      secretKey,
      { expiresIn: '60000000' }
    );
    res.cookie("token", token);
    res.status(200).json({
      status: true,
      message: "User logged in successfully",
      token,
      clientId,
      userPermissionsArray,
      locations: JSON.stringify(location),
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal server error");
  }

};


// get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.findAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal server error");
  }
};