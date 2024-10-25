import * as productRepository from '../repository/productRepository.js'
import { findUserId } from '../repository/clientUserRepository.js';
export async function addProducts(info) {
    return await productRepository.addProduct(info)
}

export async function getAllProducts(data) {
    return await productRepository.getAllProduct(data)
}
export async function getSingleProductDetails(productName) {
    const result = await productRepository.getSingleProduct(productName);
    if (!result) {
        return null;
    }

    // Extracting product details
    const productDetails = {
        productId: result.dataValues.productId,
        productName: result.dataValues.productName,
        type: result.dataValues.type,
        alternativeName: result.dataValues.alternativeName,
        kind: result.dataValues.kind,
        uomGroup: result.dataValues.uomGroup,
        singleSlab: result.dataValues.singleSlab,
        glInventoryLinkAccount: result.dataValues.glInventoryLinkAccount,
        glIncomeAccount: result.dataValues.glIncomeAccount,
        glCostGoodsAccount: result.dataValues.glCostGoodsAccount,
        status: result.dataValues.status,
    };

    // Extracting slab details and merging into the product details
    productDetails.slabDetails = result.salesProductDetails.map(saleDetail => {
        return saleDetail.productInventoryInvoiceMapper.map(mapper => {
            return mapper.productInventoryInvoice.slabDetails;
        }).flat();
    }).flat();

    // Return the combined object
    return productDetails;
}


export async function updateProduct(productName, info) {
    return await productRepository.updateProduct(productName, info)
}