import * as productRepository from '../repository/productRepository.js'

export async function addProducts(info){
    return await productRepository.addProduct(info)
}

export async function getAllProducts(search){
    return await productRepository.getAllProduct(search)
}

export async function getSingleProductDetails(productName){
    return await productRepository.getSingleProduct(productName)
}

export async function updateProduct(productName, info){
    return await productRepository.updateProduct(productName, info)
}