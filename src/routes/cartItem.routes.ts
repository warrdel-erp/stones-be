import { Router } from "express";
import * as cartItemController from "../controllers/cartItem.controller";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { createCartItemSchema } from "../validators";

const router = Router();

// Get cart items for authenticated user
router.get("/", authenticateUser, cartItemController.getCartItems);

// Get cart count for authenticated user
router.get("/count", authenticateUser, cartItemController.getCartCount);

// Create a new cart item
router.post("/", authenticateUser, validateRequest(createCartItemSchema), cartItemController.createCartItem);

// Delete a cart item by ID
router.delete("/:id", authenticateUser, cartItemController.deleteCartItem);

export default router; 