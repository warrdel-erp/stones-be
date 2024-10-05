import * as vendorRepository from '../repository/vendorRepository.js';

export async function addVendor(info){
    return await vendorRepository.addVendors(info);
}

export async function getAllVendor(data){
    return await vendorRepository.getAllVendor(data)
}
