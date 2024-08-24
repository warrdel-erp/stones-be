import * as customerRepository from '../repository/customerRepository.js'
import { findUserId } from '../repository/clientUserRepository.js';
export async function addCustomer(info){
    return await customerRepository.addCustomer(info);
}

export async function getAllCustomers(data){
    return await customerRepository.getAllCustomers(data);
}

export async function getSingleCustomer(customerName){
    return await customerRepository.getSingleCustomer(customerName);
}
export async function getCustomerID(){
    const result = await customerRepository.getCustomerID()
    let customerNumber; // declare newPo outside the if-else blocks
    if (!result) {
        customerNumber = "0001";
    } else {
        let lastCustomerID = parseInt(result.get('customerId'));
        customerNumber = String(lastCustomerID + 1).padStart(4, '0');
    }
    return customerNumber;
    // return await customerRepository.getCustomerID();
}