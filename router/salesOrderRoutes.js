import {Router} from  'express';
const router =  Router();
import { userAuth } from '../middleware/authUser.js';
import { createOrder,getSoNumber,singleSoDetails,addProduct,loadingOrder,getAllOpenSo,updateStatus} from "../controllers/salesOrderController.js";

router.post('/',userAuth, createOrder);

router.get('/', userAuth,getSoNumber);

router.get('/soNumber',userAuth, singleSoDetails);

router.post('/addProduct', userAuth,addProduct);

router.post('/loadingOrder',userAuth, loadingOrder);

router.get('/allPo',userAuth, getAllOpenSo);

router.patch('/:soLoadingOrderId',userAuth, updateStatus);

export default router;