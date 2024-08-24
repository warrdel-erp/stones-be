import * as customerService from '../services/customerServices.js';

// 1. Create customer
export const addCustomer = async (req, res) => {
    try {
        const info = req.body;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const result = await customerService.addCustomer({...info,createdBy});
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in addCustomer:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 2. Get all customers
export const getAllCustomers = async (req, res) => {
    let { search } = req.query;
    search = search || 'all';
    const clientId= req.clientId; 
    try {
        const result = await customerService.getAllCustomers({search,clientId});
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting customers:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 3. Get single customer details
export const getSingleCustomerDetails = async (req, res) => {
    const customerName = req.query.customerName;
    try {
        if (!customerName) {
            res.status(400).send("customerName is required");
        }
        const result = await customerService.getSingleCustomer(customerName);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${customerName} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};
export const getCustomerID = async (req,res) => { 
    try {
        const result = await customerService.getCustomerID();
        res.status(200).send(result);
    } catch (error) {
        console.error("server error:", error);
        res.status(500).send("Internal Server Error");
    }
};