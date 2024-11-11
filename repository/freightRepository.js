import * as model from '../models/index.js';
import { Op, where } from "sequelize";


//create freight bills
export async function addFreightBill(data) {
    try {
        const result = await model.freightBillsModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in creatibg freight Bills:", error);
        throw error;
    }
};


//create freight bills details
export async function addFreightBillDetails(data) {
    console.log(data, 'djdd');

    try {
        const result = await model.freightDetailsModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in creatibg freight Bills:details", error);
        throw error;
    }
};


//get freight details 


export async function getFreightData(data) {
    console.log(data, 'data');
    try {
        const result = await model.freightBillsModel.findAll({
            where: {
                poSupplierInvoiceMapperId: data.poSupplierInvoiceMapperId,
                // poSupplierInvoiceId: data.poSupplierInvoiceId
            },
            // attributes:{ex:['location']},
            include: [
                {
                    model: model.freightDetailsModel,
                    as: 'freightBillsDetails'
                }
            ]
        });

        return result;
    } catch (error) {
        console.error("Error in getting freight details:", error);
        throw error;
    }
}


//get freight repository

export async function getFreightAccounts() {
    try {

        const result = await model.accountsModel.findAll({
            // where: {
            //     subAccountType: 'Expenses Classified By Nature'
            // },
            // include: [
            //     {
            //         model: model.accountsModel,
            //         attributes: ['accountName', 'accountsId', 'accountBalance', 'coaCode'],
            //         as: 'accountSubtype',
                    where: {
                        accountName:'Freight Payables '
                    }
            //     }
            // ]
        })
        console.log(result);
        
        return result;
    } catch (error) {
        console.error("Error fetching transaction data:", error);
        throw new Error('Failed to fetch transaction data');
    }
}