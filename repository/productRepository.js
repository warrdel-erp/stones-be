import * as model from '../models/index.js'
import { Op } from 'sequelize';

export async function addProduct(data) {
    try {
        const result = await model.productModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in addProduct:", error);
        throw error;
    }
}

export async function getAllProduct(productName) {
    let result;
    try {
        const attributes = ['productName', 'type', 'kind', 'productId','alternativeName','category', 'subCategory', 'origin', 'groupsAll', 'priceRange', 'supplierSku'];
        if (productName !== 'all') {
            result = await model.productModel.findAll({
                attributes: attributes,
                where: {
                    product_name: {
                        [Op.like]: `%${productName}%`
                    }
                },
            });
        } else {
            result = await model.productModel.findAll({
                attributes: attributes,
            });
        }
        return result;
    } catch (error) {
        console.error(`Error in getting supplier name${productName}:`, error);
        throw error;
    }
}

export async function getSingleProduct(productName) {
    try {
        const result = await model.productModel.findOne({
            where: {
                product_name: productName
            }
        });
        return result;
    } catch (error) {
        console.error(`Error in ${productName}:`, error);
        throw error;
    }
}

export async function updateProduct(productName, data) {
    try {
        const result = await model.productModel.update(data, {
            where: {
                productName: productName
            }
        });
     return result; 
    } catch (error) {
        console.error("Error updating product:", error);
        throw error; 
    }
}

// get single product details by id
export async function getProductByProductId(productId) {
    try {
        const result = await model.productModel.findOne({
            where: {
                product_id: productId
            }
        });
        return result;
    } catch (error) {
        console.error(`Error in getting product${productId}:`, error);
        throw error;
    }
}