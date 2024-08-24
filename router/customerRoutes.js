import { addCustomer ,getAllCustomers,getSingleCustomerDetails,getCustomerID} from "../controllers/customerController.js"
import { userAuth } from '../middleware/authUser.js';
// router
import {Router} from  'express'
const router =  Router();

router.post('/',userAuth, addCustomer)

router.get('/all',userAuth, getAllCustomers)

router.get('/', getSingleCustomerDetails)

router.get('/getCustomerID', getCustomerID)

export default router