import {Router} from  'express';
const router =  Router();
import {getDashBoardData} from '../controllers/dashboardController.js';

router.get('/all', getDashBoardData);

export default router;