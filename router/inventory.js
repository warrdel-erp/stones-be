import { Router } from 'express';
import { userAuth } from '../middleware/authUser.js';
import { inventoryBalance } from '../controllers/inventoryController.js';
const router = Router();

router.get('/inventoryBalance', userAuth, inventoryBalance)

export default router;  