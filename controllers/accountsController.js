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