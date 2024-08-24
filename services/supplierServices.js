import * as supplierRepository from '../repository/supplierRepository.js'
import { findUserId } from '../repository/clientUserRepository.js';
export async function addSupplier(info){
    return await supplierRepository.addSupplier(info)
}

export async function getAllSupplier(data){
    return await supplierRepository.getAllSupplierName(data)
}

export async function getSingleSupplierDetails(productName){
    return await supplierRepository.getSingleSupplier(productName)
}

export async function updateSupplier(productName, info){
    return await supplierRepository.updateSupplier(productName, info)
}