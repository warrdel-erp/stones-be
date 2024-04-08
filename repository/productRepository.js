import * as model from '../models/index.js'

export async function addProduct(data) {
    try {
        const result = await model.productModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in addProduct:", error);
        throw error;
    }
}

export async function getAllProduct() {
    try {
        const result = await model.productModel.findAll({
            attributes: ['productName','type','kind','category','subCategory','origin','groupsAll','priceRange','supplierSku']
        });
        return result;
    } catch (error) {
        console.error("Error in getAllProduct:", error);
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