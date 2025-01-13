import filterObject from '../helpers/filteredKeysUtils.js';
import { findPoNumber } from '../repository/purchaseOrderRepository.js';
import * as purchaseOrderService from '../services/purchaseOrderServices.js'
import { paginationValidation } from '../zodValidations/purchaseOrder/pagination.js';
import { ErrorResponse, SuccessResponse } from '../helpers/response.js';

// 1. create order
export const createOrder = async (req, res) => {
    try {
        const info = req.body;
        const { po, poDate } = req.body;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const clientId = req.clientId;
        const poDetails = await findPoNumber(po, clientId);
        const data = filterObject(info)

        if (!(po && poDate)) {
            res.status(400).send("PO Number and PO Date is required");
        } else if (poDetails) {
            res.status(400).send("PO Number can't Be Same");
        } else {
            const result = await purchaseOrderService.createOrder({ ...data, createdBy });
            res.status(200).send(result);
        }
    } catch (error) {
        console.error("Error in create Order: ", error);
        res.status(500).send(error);
    }
};

// 2. get po Number 
export const getPoNumber = async (req, res) => {
    try {
        const clientId = req.clientId;
        const result = await purchaseOrderService.getPoNumber(clientId);

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in getting Po Number:", error);
        res.status(500).send("Internal Server Error");
    }
};


// 3. update order 
export const updateOrder = async (req, res) => {
    const poNumber = req.params;
    const info = req.body;
    try {
        const result = await purchaseOrderService.updateOrder(poNumber, info);
        res.status(200).send(result);

    } catch (error) {
        console.error(`Error in updating po Number${poNumber}:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 4. add purchase order product 
export const addPurchaseOrderProduct = async (req, res) => {
    try {
        const data = req.body;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const result = await purchaseOrderService.addPurchaseOrderProduct(data, createdBy);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Purchase  Order Products: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 5. get all Purchase Order
export const getAllOpenPo = async (req, res) => {
    const locationId = req.user?.dataValues?.lastSelectedLocation;
    let { search, status } = req.query;
    const clientId = req.clientId;
    const queriedData = req.query;

    let limit = Number(req.query?.limit) || 50;
    let page = Number(req.query?.page) || 1;

    try {
        const result = await purchaseOrderService.getAllPo(
            { search, clientId, queriedData, locationId, status },
            limit, page
        );
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all  PO :", error);
        res.status(500).send("Internal Server Error");
    }
};

// 6. get single purchase order details

export const singlePoDetails = async (req, res) => {
    const purchaseOrderId = req.query.purchaseOrderId;
    try {
        if (!purchaseOrderId) {
            res.status(400).send("purchase order number is required");
        }
        const result = await purchaseOrderService.singlePoDetails(purchaseOrderId);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${purchaseOrderId} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 7. add Supplier Invoice 
export const addSuplierInvoice = async (req, res) => {
    try {
        const data = req.body
        const poNumber = req.body.po;
        const purchaseOrderId = req.body.purchaseOrderId;
        const user = req.user;
        const createdBy = user.dataValues.id;
        if (!(poNumber && purchaseOrderId)) {
            res.status(400).send("po and purchase Order Id is required for add supplier invoice");
        }
        const result = await purchaseOrderService.addSuplierInvoice({ ...data, createdBy });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add supplier Invoice: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 8 add Slab Details

export const addSlabDetails = async (req, res) => {
    try {
        const data = req.body
        const po = req.body.po;
        const user = req.user;
        const createdBy = user.dataValues.id;
        if (!(po)) {
            return res.status(400).send("Po is required for add Slab Details");
        }
        const result = await purchaseOrderService.addSlabDetails({ ...data, createdBy });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Slab Details: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 9. get Slab details

export const singleSlabDetails = async (req, res) => {
    const purchaseOrderId = req.query.purchaseOrderId;
    const poSupplierInvoiceMappperId = req.query.poSupplierInvoiceMappperId
    try {
        if (!purchaseOrderId && poSupplierInvoiceMappperId) {
            res.status(400).send("purchase order number and po Supplier Invoice Mappper Id is required");
        }
        const result = await purchaseOrderService.singleSlabDetails(purchaseOrderId, poSupplierInvoiceMappperId);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${purchaseOrderId} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 10. add Product Inventory

export const addProductInventory = async (req, res) => {
    try {
        const data = req.body
        const poSupplierInvoiceMapperId = req.body.poSupplierInvoiceMapperId;
        const user = req.user;
        const createdBy = user.dataValues.id;
        if (!(poSupplierInvoiceMapperId)) {
            res.status(400).send("po Supplier Invoice Mapper Id  is required for add product Inventory");
        }
        const result = await purchaseOrderService.addProductInventory({ ...data, createdBy });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add product Inventory: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 11. get inventory product data
export const getProductInventory = async (req, res) => {
    try {
        const clientId = req.clientId;
        const page = parseInt(req.query.page) || 0;  // Default to page 0 if not provided
        const limit = 10;  // Fixed limit of 10 items per page
        const result = await purchaseOrderService.getProductInventory(page, limit, clientId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting Product Inventory:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 12 add payment of slab

export const addPayment = async (req, res) => {
    try {
        const data = req.body;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const poSupplierInvoiceMapperId = req.body.poSupplierInvoiceMapperId;
        if (!(poSupplierInvoiceMapperId)) {
            res.status(400).send("po Supplier Invoice Mapper Id  is required for make payment");
        }
        const result = await purchaseOrderService.addPayment({ ...data, createdBy });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add payment: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// 13 get payment details

export const getPaymentDetails = async (req, res) => {
    const poSupplierInvoiceMappperId = req.query.poSupplierInvoiceMappperId
    try {
        if (!poSupplierInvoiceMappperId) {
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

export const addContainer = async (req, res) => {
    try {
        const data = req.body
        const { poSupplierInvoiceMapperId, containerNumber, receivedBy } = req.body;
        if (!(poSupplierInvoiceMapperId && containerNumber && receivedBy)) {
            res.status(400).send("po Supplier Invoice Mapper,containerNumber");
        }
        const result = await purchaseOrderService.addContainer(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add container: ", error);
        res.status(500).send("Internal Server Error");
    }
};

//15 get container details

export const getContainerDetails = async (req, res) => {
    const poSupplierInvoiceMappperId = req.query
    try {
        if (!poSupplierInvoiceMappperId) {
            res.status(400).send("po Supplier Invoice Mappper Id is required");
        }
        const result = await purchaseOrderService.getContainerDetails(poSupplierInvoiceMappperId);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting  container detail for poSupplierInvoiceMappperId :-${poSupplierInvoiceMappperId} :`, error);
        res.status(500).send("Internal Server Error");
    }
};


//16. purchase account transaction

export const purchaseAccountTransaction = async (req, res) => {
    const transactionData = req.body;
    try {
        const user = req.user;
        const createdBy = user.dataValues.id;
        const result = await purchaseOrderService.purchaseAccountTransaction({ ...transactionData, createdBy });
        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


//get coa transaction details
export const getCOATransactionDetails = async (req, res) => {
    try {
        const { soLoadingOrderId, poSupplierId, poSupplierInvoiceMapperId, customerId, accountsId, supplierId, so } = req.query;
        const queryParams = {
            soLoadingOrderId,
            poSupplierId,
            poSupplierInvoiceMapperId,
            customerId,
            accountsId,
            supplierId,
            so
        };
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });
        let transactionData;
        if (Object.keys(queryParams).length > 0) {
            transactionData = await purchaseOrderService.getCOATransactionDetails(queryParams);
        } else {
            transactionData = await purchaseOrderService.getCOATransactionDetails();
        }
        res.status(200).send(transactionData);
    } catch (error) {
        console.error('Error fetching COA transaction details:', error);
        res.status(500).send("Internal Server Error");
    }
}



export const getInventoryListBasedOnSipl = async (req, res) => {
    const locationId = req.user?.dataValues?.lastSelectedLocation;

    let limit = Number(req.query?.limit) || 50;
    let page = Number(req.query?.page) || 1;

    try {
        const clientId = req.clientId;
        const result = await purchaseOrderService.getInventoryListBasedOnSipl(clientId, locationId, limit, page);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting Product Inventory:", error);
        res.status(500).send("Internal Server Error");
    }
};


export const updateSlabDetails = async (req, res) => {
    try {
        const data = req.body;
        const result = await purchaseOrderService.updateSlabDetails(data);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add Slab Details: ", error);
        res.status(500).send("Internal Server Error");
    }
};

//delete prepurchase order products
export const deletePrePurchaeProduct = async (req, res) => {
    try {
        const { purchaseOrderProductId } = req.params;
        const result = await purchaseOrderService.deletePrePurchaeProducts(purchaseOrderProductId);
        res.sendStatus(200).send(result);
    } catch (error) {
        console.error("Error in add Slab Details: ", error);
        res.status(500).send("Internal Server Error");
    }
};

//update prepurchase products 


export const updatePrePurchaseProduct = async (req, res) => {
    try {
        const data = req.body;
        const result = await purchaseOrderService.updatePrePurchaseProduct(data);
        res.status(200).send({
            success: true,
            message: "Pre purchaseProduct updated successfully.",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


export const getSupplierInvoices = async (req, res) => {
    try {
        const data = req.query;
        const clientId = req.clientId;
        const result = await purchaseOrderService.getSupplierInvoices({ ...data, clientId });
        res.status(200).send({
            success: true,
            message: "Supplier invoices retrieved successfully.",
            data: result,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message || "An unexpected error occurred.",
        });
    }
};


export const addToCart = async (req, res) => {
    try {
        const data = req.body;
        const createdBy = req.user.dataValues.id;
        const result = await purchaseOrderService.addToCart({ ...data, createdBy });
        if (result) {
            res.status(200).send({ success: true, data: result });
        } else {
            res.status(400).send({ success: false, message: "Failed to add to cart." });
        }
    } catch (error) {
        console.error("Error in addToCart: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};


export const deleteCartItem = async (req, res) => {
    try {
        const data = req.body;
        const result = await purchaseOrderService.deleteCartItem(data);
        if (result) {
            res.status(200).send({ success: true, data: result });
        } else {
            res.status(400).send({ success: false, message: "Failed to delete to cart." });
        }
    } catch (error) {
        console.error("Error in delete ToCart: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getCartItems = async (req, res) => {
    try {
        const data = req.query;
        const createdBy = req.user.dataValues.id;
        const result = await purchaseOrderService.getCartItems(data, createdBy);
        res.status(200).send({
            success: true,
            message: "get cart items retrieved successfully.",
            data: result,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message || "An unexpected error occurred.",
        });
    }
};



export const convertCartItemToHold = async (req, res) => {
    try {
        const data = req.body;
        // const createdBy = req.user.dataValues.id;
        // const result = await purchaseOrderService.convertCartItemsToSO({...data,createdBy});
        const result = await purchaseOrderService.convertCartItemToHold(data);
        if (result) {
            res.status(200).send({ success: true, data: result });
        } else {
            res.status(400).send({ success: false, message: "Failed to conver cart to Hold ." });
        }
    } catch (error) {
        console.error("Error in cart to Hold: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};


export const convertCartItemToSO = async (req, res) => {
    try {
        const data = req.body;
        // const createdBy = req.user.dataValues.id;
        // const result = await purchaseOrderService.convertCartItemsToSO({...data,createdBy});
        const user = req.user;
        const createdBy = user.dataValues.id;
        const clientId = req.clientId;
        const result = await purchaseOrderService.convertCartItemToSO(data, createdBy, clientId);
        if (result) {
            res.status(200).send({ success: true, data: result });
        } else {
            res.status(400).send({ success: false, message: "Failed to conver cart to SO ." });
        }
    } catch (error) {
        console.error("Error in cart to SO: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getSuppliersPOJournal = async (req, res) => {
    try {
        const data = req.query;
        const result = await purchaseOrderService.getSuppliersPOJournal(data);
        res.status(200).send({
            success: true,
            message: " supplier journal retrieved successfully.",
            data: result,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message || "An unexpected error occurred.",
        });
    }
};


export const slabLocationTransfer = async (req, res) => {
    try {
        const data = req.body;
        const result = await purchaseOrderService.slabLocationTransfer(data);
        if (result) {
            res.status(200).send({ success: true, data: result });
        } else {
            res.status(400).send({ success: false, message: "Failed to transfer slab inventory ." });
        }
    } catch (error) {
        console.error("Error in transfer slabs: ", error);
        res.status(500).send({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getSlabInfo = async (req, res) => {
    try {
        const { poSlabDetailId } = req.query;
        if (!poSlabDetailId) {
            return res.status(404).send({ message: 'poSlabDetailId Required' })
        }
        const result = await purchaseOrderService.getSlabInfo(poSlabDetailId);
        res.status(200).send({
            success: true,
            result,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal Server Error",
            error: error.message || "An unexpected error occurred.",
        });
    }
};

export const cancelPurchaseOrder = async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Validate that id is a valid number.
        if (isNaN(id)) {
            return ErrorResponse(res, 400, "Invalid id.")
        }

        // Service to cancel purchase order.
        const result = await purchaseOrderService.cancelPurchaseOrder(id);

        // if 0th index of result is 0 then update operation is not successfully done. 
        if (result[0] == 0) {
           return ErrorResponse(res, 400, "Purchase order does not cancelled.");
        }

        return SuccessResponse(res, 200, "Purchase order cancelled successfully.")
    } catch (error) {
        return ErrorResponse(res, 500, error.message, error.stack);
    }
};