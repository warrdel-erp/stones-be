import {Router} from  'express';
const router =  Router();

import { createOrder,getSoNumber,singleSoDetails,addProduct,loadingOrder,getAllOpenSo,updateStatus} from "../controllers/salesOrderController.js";

router.post('/', createOrder);

router.get('/', getSoNumber);

router.get('/soNumber', singleSoDetails);

router.post('/addProduct', addProduct);

router.post('/loadingOrder', loadingOrder);

router.get('/allPo', getAllOpenSo);

router.patch('/:soLoadingOrderId', updateStatus);

export default router;