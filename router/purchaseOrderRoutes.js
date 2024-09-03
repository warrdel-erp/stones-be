import {Router} from  'express'
import { userAuth } from '../middleware/authUser.js'; 
const router =  Router();

import { createOrder,getPoNumber,updateOrder,addPurchaseOrderProduct,singlePoDetails,addSuplierInvoice,getAllOpenPo,
    addSlabDetails,singleSlabDetails,addProductInventory,getProductInventory,addPayment,getPaymentDetails,addContainer,getContainerDetails,
    purchaseAccountTransaction,
    getCOATransactionDetails,
    getInventoryListBasedOnSipl,
    updateSlabDetails,
    deletePrePurchaeProduct,
    updatePrePurchaseProduct,
    
} from "../controllers/purchaseOrderControllers.js"

router.patch('/prePurchaseProduct',updatePrePurchaseProduct)

router.patch('/slabDetails',updateSlabDetails);

router.post('/',userAuth, createOrder);

router.get('/',userAuth, getPoNumber);

router.patch('/:po', userAuth, updateOrder);

router.post('/addPurchaseProduct',userAuth, addPurchaseOrderProduct);

router.get('/purchaseOrderId',userAuth, singlePoDetails);

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

router.post('/purchaseAccountTransaction',userAuth,purchaseAccountTransaction)

router.get('/transactionDetailsCOA',getCOATransactionDetails);

router.get('/inventoryDetailsBasedOnSipl', userAuth,getInventoryListBasedOnSipl);

router.delete('/prePurcahseProduct/:purchaseOrderProductId',deletePrePurchaeProduct);

export default router