import { Router } from "express";
const router = Router();
import { register,getClientDetails } from "../../controllers/clientController.js";


router.post('/register', register);

router.get('/', getClientDetails)

export default router;
