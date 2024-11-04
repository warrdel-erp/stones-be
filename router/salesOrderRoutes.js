import { Router } from 'express';
const router = Router();
import { userAuth } from '../middleware/authUser.js';
import { createOrder, getSoNumber, singleSoDetails, addProduct, loadingOrder, getAllOpenSo, updateStatus, addPayment, createSalesAccountTransaction, closeSalesOrder } from "../controllers/salesOrderController.js";

router.patch('/soClose', closeSalesOrder);

router.post('/', userAuth, createOrder);

router.get('/', userAuth, getSoNumber);

router.get('/soNumber', userAuth, singleSoDetails);

router.post('/addProduct', userAuth, addProduct);

router.post('/loadingOrder', userAuth, loadingOrder);

router.get('/allPo', userAuth, getAllOpenSo);

router.patch('/:soLoadingOrderId', userAuth, updateStatus);

router.post('/addPayment', addPayment);

router.post('/salesAccountTransaction', userAuth, createSalesAccountTransaction);





export default router;