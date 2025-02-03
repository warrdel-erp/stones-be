import { addProduct, getAllProducts, getProductDetailForOpenSO, getSingleProductDetails, updateProduct } from "../controllers/productController.js"
// router
import { Router } from 'express'
import { userAuth } from "../middleware/authUser.js";
const router = Router();

router.post('/', userAuth, addProduct)

router.get('/all', userAuth, getAllProducts)

router.get('/', userAuth, getSingleProductDetails)

router.get('/:productId/openSo', userAuth, getProductDetailForOpenSO)

router.patch('/:productName', userAuth, updateProduct)

export default router