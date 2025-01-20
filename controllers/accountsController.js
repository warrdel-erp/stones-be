import { findAccountNumber } from '../repository/accountsRepository.js';
import * as accountsService from '../services/accountsServices.js';

export const addAccount = async (req, res) => {
    try {
        const info = req.body;
        const { accountName, subAccountTypesId } = info;
        if (!(accountName, subAccountTypesId)) {
            return res.status(400).json({ message: 'Account Name, sub Account Types Id are required' });
        };
        const result = await accountsService.addAccount(info);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Account:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const getAllAccounts = async (req, res) => {
    let { search } = req.query
    try {
        const result = await accountsService.getAllAccounts(search);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all accounts :", error);
        res.status(500).send("Internal Server Error");
    }
};

export const getAllAccountsTypeAndSubTypes = async (req, res) => {
    try {
        const result = await accountsService.getAllAccountsTypeAndSubTypes();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all accounts type and sub type:", error);
        res.status(500).send("Internal Server Error");
    }
};

// update account 
export const updateAccount = async (req, res) => {
    const { accountsId, accountTypesId, subAccountTypesId, accountName } = req.body;
    const info = req.body;

    try {
        if (!(accountsId && accountTypesId && subAccountTypesId && accountName)) {
            res.status(400).send("accounts Id, account Types Id,sub Account Types Id and account Name is required");
        }
        const result = await accountsService.updateAccount(accountsId, info);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in updating account Id ${accountsId}:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// delete account 
export const deleteAccount = async (req, res) => {
    const { accountsId } = req.params;
    const accountDetails = await findAccountNumber(accountsId)
    try {
        if (!accountsId) {
            res.status(400).send("accounts Id is required");
        } else if (!accountDetails) {
            res.status(400).send("accounts Id is not correct");
        } else {
            const result = await accountsService.deleteAccount(accountsId);
            res.status(200).send(result);
        }
    } catch (error) {
        console.error(`Error in deleting account Id ${accountsId}:`, error);
        res.status(500).send("Internal Server Error");
    }
};


//get cash and financial asset list

export const getCashFinancialAssestOptions = async (req, res) => {
    try {
        const result = await accountsService.getCashFinancialAssestOptions();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all sub accounts type :", error);
        res.status(500).send("Internal Server Error");
    }
};


//find grouped accounts list
export const getGroupedAccountList = async (req, res) => {
    try {
        const result = await accountsService.getGroupedAccountList();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all grouped list accounts type :", error);
        res.status(500).send("Internal Server Error");
    }
};

//get account id by account name

export const getAccountIdByAccountName = async (req, res) => {
    try {
        const requestData = req.body
        const result = await accountsService.getAccountIdByAccountName(requestData);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all grouped list accounts type :", error);
        res.status(500).send("Internal Server Error");
    }
};


//get coa transaction details
export const getCOATransactionDetails = async (req, res) => {
    try {
        const clientId = req.clientId;
        const { soLoadingOrderId, poSupplierId, poSupplierInvoiceMapperId, customerId, accountsId, supplierId, so, month, year } = req.query;
        const queryParams = {
            soLoadingOrderId,
            poSupplierId,
            poSupplierInvoiceMapperId,
            customerId,
            accountsId,
            supplierId,
            so,
            month, year,
            clientId
        };
        console.log(queryParams, 'queryparams');

        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });
        let transactionData;
        if (Object.keys(queryParams).length > 0) {
            transactionData = await accountsService.getCOATransactionDetails({ ...queryParams });
        } else {
            transactionData = await accountsService.getCOATransactionDetails(clientId);
        }
        res.status(200).send(transactionData);
    } catch (error) {
        console.error('Error fetching COA transaction details:', error);
        res.status(500).send("Internal Server Error");
    }
}


//get the transaction history based on the suppliers or customers
export const getTransactionSupplierCustomers = async (req, res) => {
    try {
        const typeOfData = req.params;
        const clientId = req.clientId;
        const result = await accountsService.getTransactionSupplierCustomer(typeOfData, req.query, clientId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all grouped list accounts type :", error);
        res.status(500).send("Internal Server Error");
    }
};


export const journalEntryCreation = async (req, res) => {
    try {
        const info = req.body;
        const result = await accountsService.journalEntryCreation(info);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Account:", error);
        res.status(500).send("Internal Server Error");
    }
};


export const getJournalEntry = async (req, res) => {
    try {
        const { poSupplierInvoiceMapperId } = req.query;
        const result = await accountsService.getJournalEntry(poSupplierInvoiceMapperId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in get Journal Entry:", error);
        res.status(500).send("Internal Server Error");
    }
};