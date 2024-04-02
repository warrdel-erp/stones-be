
import {Router} from  'express'

const router =  Router();

import { getAllSelectBoxData} from "../controllers/settingsController.js"

router.get(`/all`, getAllSelectBoxData)

export default router;