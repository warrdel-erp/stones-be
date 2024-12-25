import { Router } from "express";
const router = Router();

import { getAllUsers, getLastSelectedLocation, login ,register, updateLastSelectedLocation } from "../../controllers/userController.js";
import {userAuth} from "../../middleware/authUser.js"

// for first time register
router.post('/register',register)

// for login
router.post("/login", login);

router.get('/get-all-users',getAllUsers)

// Last selected location
router.patch('/lastSelectedLocation',userAuth, updateLastSelectedLocation)
router.get('/lastSelectedLocation',userAuth, getLastSelectedLocation)


export default router;
