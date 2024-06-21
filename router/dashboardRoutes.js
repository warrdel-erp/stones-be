import {Router} from  'express';
const router =  Router();
import {getDashBoardData,getCalenderMonth,getCalenderDate} from '../controllers/dashboardController.js';

router.get('/all', getDashBoardData);

router.get('/calenderMonth', getCalenderMonth);

router.get('/calenderDate', getCalenderDate);

export default router;