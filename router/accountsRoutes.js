import {Router} from  'express';
const router =  Router();
import { addAccount, getAllAccounts,getAllAccountsTypeAndSubTypes,updateAccount,deleteAccount, getCashFinancialAssestOptions, getGroupedAccountList, getAccountIdByAccountName} from '../controllers/accountsController.js';

router.post('/', addAccount);

router.get('/all', getAllAccounts);

router.get('/allTypes', getAllAccountsTypeAndSubTypes);

router.patch('/:accountsId', updateAccount);

router.delete('/:accountsId', deleteAccount);

router.get('/cashFinancialAssetList',getCashFinancialAssestOptions);

router.get('/groupedListAccounts',getGroupedAccountList);

router.get('/accountIdsByName',getAccountIdByAccountName)

export default router;