import {Router} from  'express';
const router =  Router();
import { addAccount, getAllAccounts,getAllAccountsTypeAndSubTypes,updateAccount,deleteAccount} from '../controllers/accountsController.js';

router.post('/', addAccount);

router.get('/all', getAllAccounts);

router.get('/allTypes', getAllAccountsTypeAndSubTypes);

router.patch('/:accountsId', updateAccount);

router.delete('/:accountsId', deleteAccount);

export default router;