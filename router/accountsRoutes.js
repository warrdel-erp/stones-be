import { Router } from 'express';
const router = Router();
import { addAccount, getAllAccounts, getAllAccountsTypeAndSubTypes, updateAccount, deleteAccount, getCashFinancialAssestOptions, getGroupedAccountList, getAccountIdByAccountName, getCOATransactionDetails, getTransactionSupplierCustomers } from '../controllers/accountsController.js';
import { userAuth } from '../middleware/authUser.js';

router.post('/', addAccount);

router.get('/all', getAllAccounts);

router.get('/allTypes', getAllAccountsTypeAndSubTypes);

router.patch('/:accountsId', updateAccount);

router.delete('/:accountsId', deleteAccount);

router.get('/cashFinancialAssetList', getCashFinancialAssestOptions);

router.get('/groupedListAccounts', getGroupedAccountList);

router.get('/transactionDetailsCOA', userAuth, getCOATransactionDetails);

router.get('/accountIdsByName', getAccountIdByAccountName);

router.get('/transactionHistory/:type', userAuth, getTransactionSupplierCustomers);

export default router;