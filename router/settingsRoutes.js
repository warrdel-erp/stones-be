
import {Router} from  'express'

const router =  Router();

import { getAllSelectBoxData,getLocation} from "../controllers/settingsController.js"

router.get(`/all`, getAllSelectBoxData)

// location 

router.get('/', getLocation)

export default router;