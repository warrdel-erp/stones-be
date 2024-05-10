import {Router} from  'express'
const router =  Router();

import { createOrder,getPoNumber,updateOrder,addPurchaseOrderProduct,singlePoDetails,addSuplierInvoice,getAllOpenPo,addSlabDetails,singleSlabDetails,addProductInventory,getProductInventory} from "../controllers/purchaseOrderControllers.js"

router.post('/', createOrder);

router.get('/', getPoNumber);

router.patch('/:po', updateOrder);

router.post('/addPurchaseProduct', addPurchaseOrderProduct);

router.get('/poNumber', singlePoDetails);

router.post('/addSuplierInvoice', addSuplierInvoice);

router.get('/allPo', getAllOpenPo);

router.post('/addSlabDetails', addSlabDetails);

router.get('/slabDetails', singleSlabDetails);

router.post('/productInventory',addProductInventory)

router.get('/productInventory',getProductInventory);


export default router