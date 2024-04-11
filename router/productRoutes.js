import { addProduct ,getAllProducts ,getSingleProductDetails ,updateProduct} from "../controllers/productController.js"

// router
import {Router} from  'express'
const router =  Router();

router.post('/', addProduct)

router.get('/all', getAllProducts)

router.get('/', getSingleProductDetails)

router.patch('/:productName', updateProduct)

export default router