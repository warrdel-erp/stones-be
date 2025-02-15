import { Router } from 'express';
import { userAuth } from '../middleware/authUser.js';
const router = Router();

import {
    addContainer,
    addPayment,
    addProductInventory,
    addPurchaseOrderProduct,
    addSlabDetails,
    addSuplierInvoice,
    addToCart,
    cancelPurchaseOrder,
    convertCartItemToHold,
    convertCartItemToSO,
    convertCartItemToUnHold,
    createDirectInvoice,
    createOrder,
    deleteCartItem,
    deletePrePurchaeProduct,
    getAllOpenPo,
    getCartItems,
    getCOATransactionDetails,
    getContainerDetails,
    getInventoryListBasedOnSipl,
    getPaymentDetails,
    getPoNumber,
    getProductInventory,
    getSlabInfo,
    getSupplierInvoices,
    getSuppliersPOJournal,
    purchaseAccountTransaction,
    singlePoDetails,
    singleSlabDetails,
    slabLocationTransfer,
    updateOrder,
    updatePO,
    updatePrePurchaseProduct,
    updateSlabDetails
} from "../controllers/purchaseOrderControllers.js";

router.patch('/cartHold', convertCartItemToHold);

router.patch('/cartUnhold', convertCartItemToUnHold);

router.patch('/prePurchaseProduct', updatePrePurchaseProduct)

router.patch('/slabDetails', updateSlabDetails);

router.post('/', userAuth, createOrder);

router.patch('/', userAuth, updatePO);

router.get('/', userAuth, getPoNumber);

router.patch('/addTotal/:po', userAuth, updateOrder);

router.post('/addPurchaseProduct', userAuth, addPurchaseOrderProduct);

router.get('/purchaseOrderId', userAuth, singlePoDetails);

router.post('/addSuplierInvoice', userAuth, addSuplierInvoice);

router.get('/allPo', userAuth, getAllOpenPo);

router.post('/addSlabDetails', userAuth, addSlabDetails);

router.get('/slabDetails', userAuth, singleSlabDetails);

router.post('/productInventory', userAuth, addProductInventory)

router.get('/productInventory', userAuth, getProductInventory);

router.post('/addPayment', addPayment);

router.get('/paymentDetails', getPaymentDetails);

router.post('/addContainer', addContainer);

router.get('/containerDetails', getContainerDetails);

router.post('/purchaseAccountTransaction', userAuth, purchaseAccountTransaction)

router.get('/transactionDetailsCOA', getCOATransactionDetails);

router.get('/inventoryDetailsBasedOnSipl', userAuth, getInventoryListBasedOnSipl);

router.delete('/prePurcahseProduct/:purchaseOrderProductId', deletePrePurchaeProduct);

router.get('/getSupplierInvoices', userAuth, getSupplierInvoices);

router.post('/addToCart', userAuth, addToCart);

router.delete('/deleteItem', deleteCartItem);

router.get('/getCartItems', userAuth, getCartItems);

router.post('/cartItemsToSO', convertCartItemToSO);

router.get('/supplierJournal', getSuppliersPOJournal);

router.post('/inventoryTransfer', slabLocationTransfer);

router.get('/getSlabInfo', getSlabInfo);

router.patch('/cancel/:id', userAuth, cancelPurchaseOrder);

router.post('/createDirectInvoice', userAuth, createDirectInvoice);

export default router