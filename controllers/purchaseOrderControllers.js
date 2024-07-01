import { findPoNumber } from '../repository/purchaseOrderRepository.js';
import * as purchaseOrderService from '../services/purchaseOrderServices.js'

// 1. create order
export const createOrder = async (req,res) => {
    try {
        const info = req.body
        const {po,poDate} = req.body
        const poDetails = await findPoNumber(po);
        if (!(po && poDate)) {
            res.status(400).send("PO Number and PO Date is required");
        }else if(poDetails){
            res.status(400).send("PO Number can't Be Same");
        }else {
            const result = await purchaseOrderService.createOrder(info);
            res.status(200).send(result);
        }
    } catch (error) {
        console.error("Error in create Order: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 2. get po Number 
export const getPoNumber = async (req,res) => { 
    try {
        const result = await purchaseOrderService.getPoNumber();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting Po Number:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 3. update order 
export const updateOrder = async (req,res) => {
    const poNumber = req.body.po;
    const info = req.body;
    const poDetails = await findPoNumber(poNumber);
    try {
        if (!poNumber){
            res.status(400).send("Po Number is required");
        }else if(!poDetails){
            res.status(400).send("Po Number Not exist");
        }else{
            const result = await purchaseOrderService.updateOrder(poNumber, info);
            res.status(200).send(result);
        }
    } catch (error) {
        console.error(`Error in updating po Number${poNumber}:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 4. add purchase order product 
export const addPurchaseOrderProduct = async (req,res) => {
    try {
        const data = req.body
        const result = await purchaseOrderService.addPurchaseOrderProduct(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Purchase  Order Products: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 5. get all Purchase Order
export const getAllOpenPo = async (req,res) => {
    let {search} = req.query
    try {
        const result = await purchaseOrderService.getAllPo(search);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all  PO :", error);
        res.status(500).send("Internal Server Error");
    }
};

// 6. get single purchase order details

export const singlePoDetails = async (req,res) => {
    const poNumber = req.query.po;
    try {
        if (!poNumber){
            res.status(400).send("purchase order number is required");
        }
        const result = await purchaseOrderService.singlePoDetails(poNumber);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${poNumber} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 7. add Supplier Invoice 
export const addSuplierInvoice = async (req,res) => {
    try {
        const data = req.body
        const poNumber = req.body.po;
        const purchaseOrderId = req.body.purchaseOrderId;
        if (!(poNumber && purchaseOrderId)) {
            res.status(400).send("po and purchase Order Id is required for add supplier invoice");
        }
        const result = await purchaseOrderService.addSuplierInvoice(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add supplier Invoice: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 8 add Slab Details

export const addSlabDetails = async (req,res) => {
    try {
        const data = req.body
        const po = req.body.po;
        if (!(po)) {
            res.status(400).send("Po is required for add Slab Details");
        }
        const result = await purchaseOrderService.addSlabDetails(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Slab Details: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 9. get Slab details

export const singleSlabDetails = async (req,res) => {
    const poNumber = req.query.po;
    const poSupplierInvoiceMappperId = req.query.poSupplierInvoiceMappperId
    try {
        if (!poNumber && poSupplierInvoiceMappperId){
            res.status(400).send("purchase order number and po Supplier Invoice Mappper Id is required");
        }
        const result = await purchaseOrderService.singleSlabDetails(poNumber,poSupplierInvoiceMappperId);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${poNumber} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 10. add Product Inventory

export const addProductInventory = async (req,res) => {
    try {
        const data = req.body
        const poSupplierInvoiceMapperId = req.body.poSupplierInvoiceMapperId;
        if (!(poSupplierInvoiceMapperId)) {
            res.status(400).send("po Supplier Invoice Mapper Id  is required for add product Inventory");
        }
        const result = await purchaseOrderService.addProductInventory(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add product Inventory: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 11. get inventory product data
export const getProductInventory = async (req,res) => { 
    try {
        const page = parseInt(req.query.page) || 0;  // Default to page 0 if not provided
        const limit = 10;  // Fixed limit of 10 items per page
        const result = await purchaseOrderService.getProductInventory(page, limit);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting Product Inventory:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 12 add payment of slab

export const addPayment = async (req,res) => {
    try {
        const data = req.body
        const poSupplierInvoiceMapperId = req.body.poSupplierInvoiceMapperId;
        if (!(poSupplierInvoiceMapperId)) {
            res.status(400).send("po Supplier Invoice Mapper Id  is required for make payment");
        }
        const result = await purchaseOrderService.addPayment(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add payment: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 13 get payment details

export const getPaymentDetails = async (req,res) => {
    const poSupplierInvoiceMappperId = req.query.poSupplierInvoiceMappperId
    try {
        if (!poSupplierInvoiceMappperId){
            res.status(400).send("po Supplier Invoice Mappper Id is required");
        }
        const result = await purchaseOrderService.getPaymentDetails(poSupplierInvoiceMappperId);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting  payment detail for poSupplierInvoiceMappperId :-${poSupplierInvoiceMappperId} :`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 14 add container Details

export const addContainer = async (req,res) => {
    try {
        const data = req.body
        const {poSupplierInvoiceMapperId,containerNumber,receivedBy} = req.body;
        if (!(poSupplierInvoiceMapperId && containerNumber && receivedBy)) {
            res.status(400).send("po Supplier Invoice Mapper,containerNumber and receivedBy Id  is required for make payment");
        }
        const result = await purchaseOrderService.addContainer(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add container: ", error);
        res.status(500).send("Internal Server Error");
    }
};

//15 get container details

export const getContainerDetails = async (req,res) => {
    const poSupplierInvoiceMappperId = req.query.poSupplierInvoiceMappperId
    try {
        if (!poSupplierInvoiceMappperId){
            res.status(400).send("po Supplier Invoice Mappper Id is required");
        }
        const result = await purchaseOrderService.getContainerDetails(poSupplierInvoiceMappperId);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting  container detail for poSupplierInvoiceMappperId :-${poSupplierInvoiceMappperId} :`, error);
        res.status(500).send("Internal Server Error");
    }
};