import * as model from '../models/index.js';
import { Op } from 'sequelize';

export async function addCustomer(data) {
    try {
        const result = await model.customerModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in addCustomer:", error);
        throw error;
    }
}

export async function getAllCustomers(customerName) {
    let result;
    try {
        const attributes = ['customerName','customerId','primaryPhoneNumber','country', 'customerType', 'primaryPhoneNumber', 'accEmail', 'address', 'city', 'state', 'zip', 'pSalesPerson', 'priceLevel', 'sAddress','sUnit','sCity','sState','sZip', 'taxExempt', 'salesTax', 'paymentTerms', 'exemptCerti', 'exemptExipry', 'internalNotes', 'deliveryNotes'];
        if (customerName !== 'all') {
            result = await model.customerModel.findAll({
                attributes: attributes,
                where: {
                    customerName: {
                        [Op.like]: `%${customerName}%`
                    }
                },
            });
        } else {
            result = await model.customerModel.findAll({
                attributes: attributes,
            });
        }
        return result;
    } catch (error) {
        console.error(`Error in getting customer ${customerName}:`, error);
        throw error;
    }
}

export async function getSingleCustomer(customerName) {
    try {
        const result = await model.customerModel.findOne({
            where: {
                customerName: customerName
            }
        });
        return result;
    } catch (error) {
        console.error(`Error in getSingleCustomer ${customerName}:`, error);
        throw error;
        return error;
    }
}

export async function getCustomerID() {
    try {
        const attributes = ['customerId'];
        const result = await model.customerModel.findOne({
          attributes: attributes,
          order: [['created_at', 'DESC']],
          limit: 1,
        });
        return result;
      } catch (error) {
        console.log("Error getting customerID: ", error);
        throw error;
      }
}