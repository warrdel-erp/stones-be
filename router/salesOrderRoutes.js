import { Router } from 'express';
const router = Router();
import { userAuth } from '../middleware/authUser.js';
import { swapSlab, createOrder, getSoNumber, singleSoDetails, addProduct, loadingOrder, getAllOpenSo, updateStatus, addPayment, createSalesAccountTransaction, closeSalesOrder, updateSlabToPicked, updateTax, getPaymentDetails, deleteSlabsSO, allPl, batchSalesInvoicing } from "../controllers/salesOrderController.js";

router.patch('/swapSlab', swapSlab);

router.patch('/slabPicked', updateSlabToPicked);

router.patch('/soClose', closeSalesOrder);

router.post('/', userAuth, createOrder);

router.get('/', userAuth, getSoNumber);

router.get('/soNumber', userAuth, singleSoDetails);

router.post('/addProduct', userAuth, addProduct);

router.post('/loadingOrder', userAuth, loadingOrder);

router.get('/allPo', userAuth, getAllOpenSo);

router.patch('/batchInvoicing', userAuth, batchSalesInvoicing);

router.patch('/:soLoadingOrderId', userAuth, updateStatus);

router.post('/addPayment', addPayment);

router.post('/salesAccountTransaction', userAuth, createSalesAccountTransaction);

router.get('/paymentDetails', getPaymentDetails);

router.put('/updateTax', userAuth, updateTax);

router.delete('/deleteSlabs', deleteSlabsSO);

router.get('/allPL', allPl);


export default router;