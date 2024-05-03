import * as supplierService from '../services/supplierServices.js'

// 1. create supplier
export const addSupplier = async (req,res) => {
    try {
        const info = req.body
        const result = await supplierService.addSupplier(info);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in addSupplier:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 2. get all supplier name
export const getAllSupplier = async (req,res) => {
    try {
        const result = await supplierService.getAllSupplier();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting suppliers name:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 3. get single supplier details
export const getSingleSupplierDetails = async (req,res) => {
    const supplierName =req.query.supplierName;
    try {
        if (!supplierName){
            res.status(400).send("supplierName is required");
        }
        const result = await supplierService.getSingleSupplierDetails(supplierName);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${supplierName} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 4. update supplier 
export const updateSupplier = async (req,res) => {
    const supplierName = req.body.supplierName || req.query.supplierName || req.headers["x-supplierName"];
    const info = req.body;
    
    try {
        if (!supplierName){
            res.status(400).send("supplierName is required");
        }
        const result = await supplierService.updateSupplier(supplierName, info);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in updating ${supplierName}:`, error);
        res.status(500).send("Internal Server Error");
    }
};