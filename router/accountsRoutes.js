import {Router} from  'express';
const router =  Router();
import { addAccount, getAllAccounts,getAllAccountsTypeAndSubTypes} from '../controllers/accountsController.js';

router.post('/', addAccount);

router.get('/all', getAllAccounts);

router.get('/allTypes', getAllAccountsTypeAndSubTypes);

export default router;