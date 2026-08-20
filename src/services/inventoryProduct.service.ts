import { sequelize } from "../config/database";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { AppError } from "../helper/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import * as models from "../models";
import InventoryProductImage from "../models/inventoryProductImage.model";
import S3File from "../models/s3File.model";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { scoped } from "../utils/scoped";
import * as s3FileService from "./s3File.service";
import { generateSignedGetUrl } from "./s3File.service";

export const getInventoryProductsBySIPLCombinedNumber = async (req: AuthRequest, siplId: number, excludeSoldCanceled = false, productId?: number) => {
    // Get inventory products by matching the middle number in combinedNumber using repository
    const inventoryProducts = await inventoryProductRepository.getInventoryProductsBySIPL(req, siplId, excludeSoldCanceled, productId);

    const plainProducts = inventoryProducts.map((ip: any) => ip.get({ plain: true }));

    await Promise.all(
        plainProducts.map(async (ip: any) => {
            if (ip.images && ip.images.length > 0) {
                const primaryImg = ip.images[0];
                if (primaryImg.s3File?.s3Bucket && primaryImg.s3File?.s3Key) {
                    primaryImg.s3File.url = await generateSignedGetUrl(primaryImg.s3File.s3Bucket, primaryImg.s3File.s3Key);
                }
                ip.primaryImage = primaryImg;
            } else {
                ip.primaryImage = null;
            }
            delete ip.images;
        })
    );

    return plainProducts;
};

export const updateInventoryProductsSellingPrice = async (ids: number[], sellingPrice: number) => {
    // Update selling price of multiple inventory products using repository
    const result = await inventoryProductRepository.updateInventoryProductsSellingPrice(ids, sellingPrice);

    return result;
};

export const getInventoryProductsBySlabField = async (req: AuthRequest, fieldName: "lot" | "block", fieldValue: string, excludeSoldCanceled = false, productId?: number) => {
    // Get inventory products by slab field filter using repository
    const inventoryProducts = await inventoryProductRepository.getInventoryProductsBySlabField(req, fieldName, fieldValue, excludeSoldCanceled, productId);

    const plainProducts = inventoryProducts.map((ip: any) => ip.get({ plain: true }));

    await Promise.all(
        plainProducts.map(async (ip: any) => {
            if (ip.images && ip.images.length > 0) {
                const primaryImg = ip.images[0];
                if (primaryImg.s3File?.s3Bucket && primaryImg.s3File?.s3Key) {
                    primaryImg.s3File.url = await generateSignedGetUrl(primaryImg.s3File.s3Bucket, primaryImg.s3File.s3Key);
                }
                ip.primaryImage = primaryImg;
            } else {
                ip.primaryImage = null;
            }
            delete ip.images;
        })
    );

    return plainProducts;
};

export const getInventoryProductsByBinId = async (req: AuthRequest, binId: number, excludeSoldCanceled = true, productId?: number) => {
    // Get inventory products by binId filter using repository
    const inventoryProducts = await inventoryProductRepository.getInventoryProductsByBinId(req, binId, excludeSoldCanceled, productId);

    const plainProducts = inventoryProducts.map((ip: any) => ip.get({ plain: true }));

    await Promise.all(
        plainProducts.map(async (ip: any) => {
            if (ip.images && ip.images.length > 0) {
                const primaryImg = ip.images[0];
                if (primaryImg.s3File?.s3Bucket && primaryImg.s3File?.s3Key) {
                    primaryImg.s3File.url = await generateSignedGetUrl(primaryImg.s3File.s3Bucket, primaryImg.s3File.s3Key);
                }
                ip.primaryImage = primaryImg;
            } else {
                ip.primaryImage = null;
            }
            delete ip.images;
        })
    );

    return plainProducts;
};

export const getAllocatedInventoryProductsAccordingToCustomer = async (customerId: number) => {
    return await inventoryProductRepository.getAllocatedInventoryProductsAccordingToCustomer(customerId);
};

export const getAllocatedInventoryProductDetails = async (inventoryProductId: number) => {

    const data: any = await inventoryProductRepository.getAllocatedInventoryProductWithSalesOrderAndCustomer(inventoryProductId);

    if (!data) {
        throw new AppError("Allocated inventory product not found", 404);
    }

    data.salesOrderProduct = data.salesOrderProducts[0]

    delete data.salesOrderProducts;

    return data;
};

export const getInventoryProducts = (filter: Record<string, string>, locationId: number) => {
    return inventoryProductRepository.getInventoryProducts(filter, locationId)
}

export const getInventoryProductsPaginated = (filter: Record<string, any>, locationId: number, limit: number, offset: number) => {
    return inventoryProductRepository.getInventoryProductsPaginated(filter, locationId, limit, offset)
}

export const assignbinInventoryProducts = async (inventoryProduct: Array<{ id: number;[key: string]: any }>) => {
    if (!inventoryProduct || inventoryProduct.length === 0) return 0;

    const transaction = await sequelize.transaction(); // Explicitly start transaction
    let affectedRows = 0;

    try {
        for (const items of inventoryProduct) {
            const { id, binId, productType, ...updateFields } = items;

            if (!id) {
                throw new AppError("id is mandatory to all slabs to update.", 400);
            }

            // If binId is provided, update the corresponding inventory product
            if (binId !== undefined) {

                const intProduct: any = await models.InventoryProduct.findByPk(id, {
                    attributes: ['id'],
                    transaction
                });

                if (!intProduct) {
                    throw new AppError(`Slab with id ${id} not found`, 404);
                }

                const [updatedInventoryProduct] = await scoped(models.InventoryProduct).update(
                    { binId },
                    {
                        where: { id: intProduct.id },
                        transaction
                    }
                );
                affectedRows += updatedInventoryProduct
            }

        }

        await transaction.commit(); // Commit transaction if everything succeeds
        return affectedRows;
    } catch (error) {
        await transaction.rollback(); // Rollback transaction on error
        throw error; // Ensure the error is propagated
    }
};



export const updateInventoryProductCartStatus = async (id: number, isInCart: boolean) => {
    await inventoryProductRepository.updateInventoryProductCartStatus(id, isInCart);
    return { message: `Inventory Product ID ${id} cart status updated to ${isInCart}` };
};


export const getInventoryProductsWithEmptyBin = async (productId?: number) => {
    return await inventoryProductRepository.getInventoryProductsWithEmptyBin(productId);
};

export const getInventoryProductByQrCode = async (qrCode: string) => {
    const data = await inventoryProductRepository.getInventoryProductByQrCode(qrCode);

    if (!data) {
        throw new AppError("Inventory product with this QR code not found", 404);
    }

    return data;
};


export const addInventoryProductImage = async (inventoryProductId: number, s3FileId: number) => {
    // Verify inventory product exists
    const inventoryProduct = await inventoryProductRepository.findInventoryProductById(inventoryProductId);
    if (!inventoryProduct) {
        throw new AppError("Inventory product not found", 404);
    }

    const count = await inventoryProductRepository.getInventoryProductImageCount(inventoryProductId);
    const isPrimary = count === 0;

    const image = await inventoryProductRepository.createInventoryProductImage(inventoryProductId, s3FileId, isPrimary);
    return image;
};

export const deleteInventoryProductImage = async (imageId: number) => {
    const transaction = await sequelize.transaction();
    try {
        const imageLink = await inventoryProductRepository.findInventoryProductImageById(imageId, transaction);

        if (!imageLink) {
            throw new AppError("Image not found", 404);
        }

        const s3FileId = (imageLink as any).s3FileId;
        const wasPrimary = (imageLink as any).isPrimary;
        const inventoryProductId = (imageLink as any).inventoryProductId;

        await inventoryProductRepository.deleteInventoryProductImage(imageId, transaction);

        if (wasPrimary) {
            const nextImage = await inventoryProductRepository.getAnotherInventoryProductImage(inventoryProductId, imageId, transaction);
            if (nextImage) {
                await inventoryProductRepository.setInventoryProductImagePrimary((nextImage as any).id, transaction);
            }
        }

        if (s3FileId) {
            await s3FileService.deleteS3File(s3FileId, transaction);
        }

        await transaction.commit();
        return { message: "Image deleted successfully" };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getInventoryProductImages = async (inventoryProductId: number) => {
    const images = await inventoryProductRepository.getInventoryProductImagesByInventoryProductId(inventoryProductId);

    const plainImages = images.map((img: any) => img.get({ plain: true }));

    await Promise.all(
        plainImages.map(async (img: any) => {
            if (img.s3File?.s3Bucket && img.s3File?.s3Key) {
                img.s3File.url = await generateSignedGetUrl(img.s3File.s3Bucket, img.s3File.s3Key);
            }
        })
    );

    return plainImages;
};

export const setPrimaryInventoryProductImage = async (inventoryProductId: number, imageId: number) => {
    const transaction = await sequelize.transaction();
    try {
        const image = await inventoryProductRepository.findInventoryProductImageById(imageId, transaction);
        if (!image || (image as any).inventoryProductId !== inventoryProductId) {
            throw new AppError("Image not found for this inventory product", 404);
        }
        await inventoryProductRepository.clearInventoryProductPrimaryImages(inventoryProductId, transaction);
        await inventoryProductRepository.setInventoryProductImagePrimary(imageId, transaction);
        await transaction.commit();
        return { message: "Primary image set successfully" };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const checkTiedToPublishedQuotation = async (inventoryProductId: number, transaction?: any) => {
    const oppQuoteInvProduct = await scoped(models.OpportunityQuotationInventoryProduct).findOne({
        where: { inventoryProductId },
        include: [{
            association: "quotation",
            where: { status: "PUBLISHED" },
            required: true
        }],
        transaction
    });

    if (oppQuoteInvProduct) {
        throw new AppError("Cannot mutate or delete this inventory product as it is currently tied to a PUBLISHED quotation", 400);
    }
};

/**
 * Common function to check if an inventory product is available for allocation/sale.
 * Requires the inventory product to be IN_INVENTORY and not have any active hold.
 */
export const checkInventoryProductAvailability = (inventoryProduct: any, allowHold: boolean = false): boolean => {
    if (!inventoryProduct) return false;
    
    if (inventoryProduct.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY) {
        return false;
    }

    if (!allowHold) {
        const hasHold = !!(inventoryProduct.hold || inventoryProduct.holdItem || (inventoryProduct.holdItems && inventoryProduct.holdItems.length > 0));
        if (hasHold) {
            return false;
        }
    }

    return true;
};

/**
 * Checks a list of inventory product IDs and returns whether they are all available,
 * and if not, which ones are unavailable.
 */
export const checkInventoryProductsAvailabilityByIds = async (
    clientId: number,
    inventoryProductIds: number[],
    allowHold: boolean = false
): Promise<{ allAvailable: boolean; unavailableItems: { id: number; combinedNumber: string; reason: string }[] }> => {
    if (!inventoryProductIds || inventoryProductIds.length === 0) {
        return { allAvailable: true, unavailableItems: [] };
    }

    const inventoryProducts = await scoped(models.InventoryProduct).findAll({
        where: {
            clientId,
            id: inventoryProductIds,
        },
        include: [
            {
                association: "holdItem",
                required: false,
            },
            {
                association: "holdItems",
                required: false,
            }
        ]
    });

    const unavailableItems: { id: number; combinedNumber: string; reason: string }[] = [];

    const foundIds = inventoryProducts.map((ip: any) => ip.id);
    const notFoundIds = inventoryProductIds.filter(id => !foundIds.includes(id));
    
    for (const notFoundId of notFoundIds) {
        unavailableItems.push({ id: notFoundId, combinedNumber: `Item #${notFoundId}`, reason: "Not found" });
    }

    for (const ip of inventoryProducts) {
        if (!checkInventoryProductAvailability(ip, allowHold)) {
            const reason = ip.status !== INVENTORY_ITEM_STATUS.IN_INVENTORY ? `Status: ${ip.status}` : "On active hold";
            unavailableItems.push({
                id: ip.id,
                combinedNumber: ip.combinedNumber || `Item #${ip.id}`,
                reason
            });
        }
    }

    return {
        allAvailable: unavailableItems.length === 0,
        unavailableItems
    };
};
