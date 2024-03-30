import { addSupplier ,getAllSupplier ,getSingleSupplierDetails ,updateSupplier} from "../controllers/supplierController.js"

// router
import {Router} from  'express'
const router =  Router();

router.post('/', addSupplier)

router.get('/all', getAllSupplier)

router.get('/:supplierName', getSingleSupplierDetails)

router.patch('/:supplierName', updateSupplier)

export default router