import { login ,register } from "../../controllers/userController.js";

// router

import { Router } from "express";
const router = Router();

// for first time register
router.post('/register',register)

// for login
router.post("/login", login);

export default router;
