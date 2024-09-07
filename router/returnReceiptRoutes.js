import {Router} from  'express';
const router =  Router();
import { addReturnSlabs, getReturnInvoice, getSalesInvoices, singleInvoiceDetails } from '../controllers/retunReceiptController.js';
import { userAuth } from '../middleware/authUser.js';

router.get('/all', userAuth,getSalesInvoices);

router.get('/invoiceDetails', userAuth, singleInvoiceDetails);

router.patch('/returnSlabs',userAuth, addReturnSlabs);

router.get('/returnInvoice', getReturnInvoice);

export default router;