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

export async function getAllProduct(data) {
    let result;
    try {
        // const attributes = ['productName', 'type', 'kind', 'productId', 'alternativeName', 'category', 'subCategory', 'origin', 'groupsAll', 'priceRange', 'supplierSku', 'createdBy', 'singleSlab'];

        if (data.search !== 'all') {
            result = await model.productModel.findAll({
                // attributes: attributes,
                where: {
                    product_name: {
                        [Op.like]: `%${data.search}%`
                    }
                },
            });
        } else {
            result = await model.productModel.findAll({
                // attributes: attributes,
                include: [
                    {
                        model: model.clientUserModel,
                        as: 'clientDetails',
                        attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                        where: {
                            clientId: data.clientId
                        },
                    }
                ],

            });
        }
        return result;
    } catch (error) {
        console.error(`Error in getting supplier name${data.search}:`, error);
        throw error;
    }
}

export async function getSingleProduct(productName) {
    try {
        const result = await model.productModel.findOne({
            where: {
                product_name: productName
            },
            include: [
                {
                    model: model.productInventoryModel,
                    as: 'salesProductDetails',
                    include: [
                        {
                            model: model.inventoryInvoiceMapper,
                            as: "productInventoryInvoiceMapper",
                            include: [
                                {
                                    model: model.poSupplierInvoiceModel,
                                    as: "productInventoryInvoice",
                                    include: [
                                        {
                                            model: model.poSlabDetails,
                                            as: "slabDetails",
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model:model.landedCostModel,
                    as: 'productLandeCost',
                    attributes: { exclude: [ 'createdAt', 'deletedAt', 'updatedAt'] },
                }
            ]
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