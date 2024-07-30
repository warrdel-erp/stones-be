import {Router} from  'express';
const router =  Router();
import { addAccount, getAllAccounts,getAllAccountsTypeAndSubTypes,updateAccount,deleteAccount, getCashFinancialAssestOptions, getGroupedAccountList} from '../controllers/accountsController.js';

router.post('/', addAccount);

router.get('/all', getAllAccounts);

router.get('/allTypes', getAllAccountsTypeAndSubTypes);

router.patch('/:accountsId', updateAccount);

router.delete('/:accountsId', deleteAccount);

router.get('/cashFinancialAssetList',getCashFinancialAssestOptions);

router.get('/groupedListAccounts',getGroupedAccountList)

export default router;