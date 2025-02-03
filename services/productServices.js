import * as productRepository from '../repository/productRepository.js'
import { findUserId } from '../repository/clientUserRepository.js';
export async function addProducts(info) {
    return await productRepository.addProduct(info)
}

export async function getAllProducts(data) {
    return await productRepository.getAllProduct(data)
}
export async function getSingleProductDetails(productName) {
    const { product, costData } = await productRepository.getSingleProduct(productName);
    if (!product) {
        return null;
    }

    // Extracting product details
    const productDetails = {
        productId: product.dataValues.productId,
        productName: product.dataValues.productName,
        type: product.dataValues.type,
        alternativeName: product.dataValues.alternativeName,
        kind: product.dataValues.kind,
        uomGroup: product.dataValues.uomGroup,
        singleSlab: product.dataValues.singleSlab,
        glInventoryLinkAccount: product.dataValues.glInventoryLinkAccount,
        glIncomeAccount: product.dataValues.glIncomeAccount,
        glCostGoodsAccount: product.dataValues.glCostGoodsAccount,
        status: product.dataValues.status,
        allProducts: product.dataValues,
        ...costData
    };

    // Extracting slab details and merging into the product details
    productDetails.slabDetails = product.salesProductDetails.map(saleDetail => {
        return saleDetail.productInventoryInvoiceMapper.map(mapper => {
            return mapper.productInventoryInvoice.slabDetails;
        }).flat();
    }).flat();

    // Return the combined object
    return productDetails;
}

export async function getOpenSoProductDetail(id){
    return await productRepository.getOpenSoProduct(id);
}

export async function updateProduct(productName, info) {
    return await productRepository.updateProduct(productName, info)
}