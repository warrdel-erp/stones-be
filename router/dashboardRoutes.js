import {Router} from  'express';
const router =  Router();
import {getDashBoardData,getCalenderMonth,getCalenderDate} from '../controllers/dashboardController.js';
import { userAuth } from '../middleware/authUser.js';

router.get('/all', userAuth, getDashBoardData);

router.get('/calenderMonth',userAuth, getCalenderMonth);

router.get('/calenderDate',userAuth, getCalenderDate);

export default router;