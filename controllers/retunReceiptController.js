
import * as returnReceiptServices from '../services/returnReceiptServices.js'

export const getSalesInvoices = async (req, res) => {
    let { search } = req.query
    const clientId = req.clientId;  
    console.log(clientId,'ckkeekk');
    
    try {
        const result = await returnReceiptServices.getSalesInvoices(search, clientId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all salesInvoices :", error);
        res.status(500).send(error);
    }
};


export const singleInvoiceDetails = async (req, res) => {
    let { search } = req.query
    const clientId = req.clientId;  
    const queries = req.query;
    console.log(queries,'quwuwu');
    
    try {
        const result = await returnReceiptServices.singleInvoiceDetails(search, clientId,queries);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all salesInvoices :", error);
        res.status(500).send(error);
    }
};


export const addReturnSlabs = async (req, res) => {
    try {
        const info = req.body;
        const result = await returnReceiptServices.addReturnSlabs(info);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in slab return Account:", error);
        res.status(500).send(error);
    }
};



export const getReturnInvoice = async (req, res) => {
    let { search } = req.query
    const clientId = req.clientId;  
    const queries = req.query;
    console.log(queries,'quwuwu');
    
    try {
        const result = await returnReceiptServices.getReturnInvoice(search, clientId,queries);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting  return invoice :", error);
        res.status(500).send(error);
    }
};
