import filterObject from '../helpers/filteredKeysUtils.js';
import * as vendorService from '../services/vendorService.js';
// 1. create vendor
export const addVendor = async (req, res) => {
    try {
        const user = req.user
        // const createdBy = user.dataValues.id
        const info = req.body;
        const data = filterObject(info)
        const result = await vendorService.addVendor({ ...data });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in add vendor:", error);
        res.status(500).send(error);
    }
};

// 2. get all vendor list
export const getAllVendor = async (req, res) => {
    let { search } = req.query
    search = search || 'all'
    const clientId = req.clientId;
    try {
        const result = await vendorService.getAllVendor({ search, clientId });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting vendors:", error);
        res.status(500).send("Internal Server Error");
    }
};

//3. get freight carried vendot

export const getFreightCarriedVendor = async (req, res) => {
    const clientId = req.clientId;
    try {
        const result = await vendorService.getFreightCarriedVendor({ clientId });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting freight carried vendors:", error);
        res.status(500).send(error);
    }
};