import * as productRepository from '../repository/productRepository.js'
import { findUserId } from '../repository/clientUserRepository.js';
export async function addProducts(info) {
    return await productRepository.addProduct(info)
}

export async function getAllProducts(data) {
    return await productRepository.getAllProduct(data)
}

export async function getSingleProductDetails(productName) {
    return await productRepository.getSingleProduct(productName)
}

export async function updateProduct(productName, info) {
    return await productRepository.updateProduct(productName, info)
}