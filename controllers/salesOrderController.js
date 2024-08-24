import { findSoNumber, findSalesOrdersInventory } from '../repository/salesOrderRepository.js';
import * as salesOrderService from '../services/salesOrderServices.js'

// 1. create order
export const createOrder = async (req, res) => {
    try {
        const user = req.user;
        const createdBy = user.dataValues.id;
        const info = req.body
        const { so, soDate, salesTax } = req.body
        const soDetails = await findSoNumber(so);
        console.log(`>>>>>>>>>>soDetails>>>>>>`, soDetails);
        if (!(so && soDate && salesTax)) {
            res.status(400).send("SO Number,SO Date and sales Tax is required");
        } else if (soDetails) {
            res.status(400).send("SO Number can't Be Same");
        } else {
            const result = await salesOrderService.createOrder({ ...info, createdBy });
            res.status(200).send(result);
        }
    } catch (error) {
        console.error("Error in create Order: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 2. get so Number 
export const getSoNumber = async (req, res) => {
    try {
        const result = await salesOrderService.getSoNumber();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting So Number:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 3. get single sales order details

export const singleSoDetails = async (req, res) => {
    const soNumber = req.query.so;
    try {
        if (!soNumber) {
            res.status(400).send("sales order number is required");
        }
        const result = await salesOrderService.singleSoDetails(soNumber);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${soNumber} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 4 add product 

export const addProduct = async (req, res) => {
    try {
        const info = req.body
        const { salesOrdersId } = req.body
        if (!(salesOrdersId)) {
            res.status(400).send("Sales orders Id is required");
        } else {
            const result = await salesOrderService.addProduct(info);
            res.status(200).send(result);
        }
    } catch (error) {
        console.error("Error in add product: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// create loading order

export const loadingOrder = async (req, res) => {
    try {
        const info = req.body
        const { salesOrdersId } = req.body
        if (!(salesOrdersId)) {
            res.status(400).send("Sales orders Id is required");
        } else {
            const result = await salesOrderService.loadingOrder(info);
            res.status(200).send(result);
        }
    } catch (error) {
        console.error("Error in create loading order: ", error);
        res.status(500).send("Internal Server Error");
    }
};

//  get all Sales Order
export const getAllOpenSo = async (req, res) => {
    let { search } = req.query;
    const clientId= req.clientId; 
    try {
        const result = await salesOrderService.getAllSo({search,clientId});
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all  SO :", error);
        res.status(500).send("Internal Server Error");
    }
};

// update Status 

export const updateStatus = async (req, res) => {
    const soLoadingOrderId = req.body.soLoadingOrderId;
    const soLoadingOrder = await findSalesOrdersInventory(soLoadingOrderId);
    const requestBodyTransaction = req.body
    console.log(soLoadingOrder,'jskjnwdiehiwuh');
    try {
        if (!soLoadingOrderId) {
            res.status(400).send("so Loading Order Id Id is required");
        } else if (!soLoadingOrder) {
            res.status(400).send("so Loading Order Id Not exist");
        } else {
            const result = await salesOrderService.updateStatus({...requestBodyTransaction,soLoadingOrderId,soLoadingOrder});
            res.status(200).send(result);
        }
    } catch (error) {
        console.error(`Error in updating sales Orders Inventory ${soLoadingOrderId}:`, error);
        res.status(500).send("Internal Server Error");
    }
};

//add payment in salesOrder
export const addPayment = async (req, res) => {
    try {
        const data = req.body
        const soLoadingOrderId = req.body.soLoadingOrderId;
        if (!(soLoadingOrderId)) {
            res.status(400).send("sales ordeer is required to make payment");
        }
        const result = await salesOrderService.addPayment(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add payment: ", error);
        res.status(500).send("Internal Server Error");
    }
};



// create sales account transaction 
export const createSalesAccountTransaction = async (req, res) => {
    const transactionData = req.body;
    console.log(transactionData,'ssssssssssssss');
    try {
        const result = await salesOrderService.createSalesAccountTransaction({...transactionData});
        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

