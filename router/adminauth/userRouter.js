import { Router } from "express";
const router = Router();

import { getAllUsers, login ,register } from "../../controllers/userController.js";
import {userAuth} from "../../middleware/authUser.js"

// for first time register
router.post('/register',register)

// for login
router.post("/login", login);

router.get('/get-all-users',getAllUsers)

export default router;
