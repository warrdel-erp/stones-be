import * as supplierRepository from '../repository/supplierRepository.js'

export async function addSupplier(info){
    return await supplierRepository.addSupplier(info)
}

export async function getAllSupplier(){
    return await supplierRepository.getAllSupplierName()
}

export async function getSingleSupplierDetails(productName){
    return await supplierRepository.getSingleSupplier(productName)
}

export async function updateSupplier(productName, info){
    return await supplierRepository.updateSupplier(productName, info)
}