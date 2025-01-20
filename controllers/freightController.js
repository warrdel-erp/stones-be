import filterObject from '../helpers/filteredKeysUtils.js';
import * as freightBillService from '../services/freightServices.js'

// 1. create order
export const addFreightBill = async (req, res) => {
    try {
        const info = req.body;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const result = await freightBillService.addFreightBill({ ...info, createdBy });
        res.status(200).send(result);

    } catch (error) {
        console.error("Error in create Order: ", error);
        res.status(500).send(error);
    }
};


//get freight data
export const getFreightData = async (req, res) => {
    const query = req.query

    try {
        const result = await freightBillService.getFreightData(query);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting all accounts :", error);
        res.status(500).send("Internal Server Error");
    }
};


//get freight accounts details

export const getFreightAccounts = async (req, res) => {
    try {
        const result = await freightBillService.getFreightAccounts();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting freight accounts :", error);
        res.status(500).send("Internal Server Error");
    }
};