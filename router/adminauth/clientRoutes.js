import { Router } from "express";
const router = Router();
import { register, getClientDetails, clientLocationCreate,getClientLocations } from "../../controllers/clientController.js";


router.post('/register', register);

router.get('/', getClientDetails);

router.post('/clientLocation', clientLocationCreate);

router.get('/clientLocations', getClientLocations);

export default router;
