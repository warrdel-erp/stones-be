import {Router} from  'express'
import { userAuth } from '../middleware/authUser.js'; 
const router =  Router();

import { createOrder,getPoNumber,updateOrder,addPurchaseOrderProduct,singlePoDetails,addSuplierInvoice,getAllOpenPo,
    addSlabDetails,singleSlabDetails,addProductInventory,getProductInventory,addPayment,getPaymentDetails,addContainer,getContainerDetails
} from "../controllers/purchaseOrderControllers.js"

router.post('/',userAuth, createOrder);

router.get('/',userAuth, getPoNumber);

router.patch('/:po', userAuth, updateOrder);

router.post('/addPurchaseProduct',userAuth, addPurchaseOrderProduct);

router.get('/poNumber',userAuth, singlePoDetails);

router.post('/addSuplierInvoice', userAuth,addSuplierInvoice);

router.get('/allPo',userAuth, getAllOpenPo);

router.post('/addSlabDetails',userAuth, addSlabDetails);

router.get('/slabDetails',userAuth, singleSlabDetails);


router.post('/productInventory',userAuth,addProductInventory)


router.get('/productInventory',userAuth,getProductInventory);

router.post('/addPayment',addPayment);

router.get('/paymentDetails',getPaymentDetails);

router.post('/addContainer',addContainer);

router.get('/containerDetails',getContainerDetails);

export default router