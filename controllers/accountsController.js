import { findAccountNumber } from '../repository/accountsRepository.js';
import * as accountsService  from '../services/accountsServices.js';

export const addAccount = async (req, res) => {
    try {
        const info = req.body;
        const {accountName,subAccountTypesId} = info;
        if(!(accountName ,subAccountTypesId)){
            return res.status(400).json({message: 'Account Name, sub Account Types Id are required'});
        };
        const result = await accountsService.addAccount(info);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Account:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const getAllAccounts = async (req,res) => {
    let {search} = req.query
    try {
        const result = await accountsService.getAllAccounts(search);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all accounts :", error);
        res.status(500).send("Internal Server Error");
    }
};

export const getAllAccountsTypeAndSubTypes = async (req,res) => {
    try {
        const result = await accountsService.getAllAccountsTypeAndSubTypes();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all accounts type and sub type:", error);
        res.status(500).send("Internal Server Error");
    }
};

// update account 
export const updateAccount = async (req,res) => {
    const {accountsId , accountTypesId,subAccountTypesId,accountName} = req.body;
    const info = req.body;
    
    try {
        if (!(accountsId && accountTypesId && subAccountTypesId && accountName)){
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
export const deleteAccount = async (req,res) => {
    const {accountsId} = req.params;
    const accountDetails = await findAccountNumber(accountsId)
    try {
        if (!accountsId){
            res.status(400).send("accounts Id is required");
        }else if(!accountDetails){
            res.status(400).send("accounts Id is not correct");
        }else{
            const result = await accountsService.deleteAccount(accountsId);
            res.status(200).send(result);
        }
    } catch (error) {
        console.error(`Error in deleting account Id ${accountsId}:`, error);
        res.status(500).send("Internal Server Error");
    }
};