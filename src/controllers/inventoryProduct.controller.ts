import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as inventoryProductService from "../services/inventoryProduct.service";
import { AppError } from "../helper/appError";
import { inventoryProductInput } from "../validators";
import { inventoryProductArraySchema } from "../validators";

export const getInventoryProductsBySIPLCombinedNumber = catchAsync(async (req: AuthRequest, res: Response) => {
    const { siplId, bundle, block } = req.query;

    // Count how many filters are provided
    const filtersProvided = [siplId, bundle, block].filter(Boolean).length;

    // Check if more than one filter is provided - only one should be used at a time
    if (filtersProvided > 1) {
        return res.status(400).json({ error: "Only one filter can be used at a time. Use either siplId OR lot OR block, not multiple." });
    }

    // Check if at least one filter is provided
    if (filtersProvided === 0) {
        return res.status(400).json({ error: "Either siplId, lot, or block filter is required" });
    }

    let data;

    if (bundle) {
        // Get inventory products by lot filter only
        data = await inventoryProductService.getInventoryProductsBySlabField("lot", bundle as string);
    } else if (block) {
        // Get inventory products by block filter only
        data = await inventoryProductService.getInventoryProductsBySlabField("block", block as string);
    } else {
        // Get inventory products by SIPL combined number only
        data = await inventoryProductService.getInventoryProductsBySIPLCombinedNumber(req, Number(siplId));
    }

    if (!data.length) {
        return SuccessResponse(res, 200, "No inventory products found", []);
    }

    SuccessResponse(res, 200, "Inventory products fetched successfully", data);
});

export const updateInventoryProductsSellingPrice = catchAsync(async (req: AuthRequest, res: Response) => {
    const { ids, sellingPrice } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs array is required and must not be empty" });
    }

    if (sellingPrice === undefined || sellingPrice === null) {
        return res.status(400).json({ error: "Selling price is required" });
    }

    if (typeof sellingPrice !== 'number' || sellingPrice < 0) {
        return res.status(400).json({ error: "Selling price must be a positive number" });
    }

    // Update selling price of inventory products
    const result = await inventoryProductService.updateInventoryProductsSellingPrice(ids, sellingPrice);

    if (result[0] === 0) {
        return res.status(404).json({ error: "No inventory products found with the provided IDs" });
    }

    SuccessResponse(res, 200, `Successfully updated selling price for ${result[0]} inventory product(s)`, {
        updatedCount: result[0],
        ids: ids,
        newSellingPrice: sellingPrice
    });
});

export const getAllocatedInventoryProductsAccordingToCustomer = catchAsync(async (req: AuthRequest, res: Response) => {
    const { customerId } = req.query;

    if (!customerId) {
        return res.status(400).json({ error: "customerId is required" });
    }

    const data = await inventoryProductService.getAllocatedInventoryProductsAccordingToCustomer(Number(customerId));

    return SuccessResponse(res, 200, "Allocated inventory products fetched successfully", data);
});

export const getAllocatedInventoryProductDetails = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!Number(id)) {
        throw new AppError('inventoryProductId is required', 400);
    }

    const data = await inventoryProductService.getAllocatedInventoryProductDetails(Number(id));

    return SuccessResponse(res, 200, "Allocated inventory products with sales order and customer fetched successfully", data);
});

export const getInventoryProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    const filter = req.query;

    const locationId = req.user?.defaultLocationId

    const data = await inventoryProductService.getInventoryProducts(filter as Record<string, string>, Number(locationId));

    return SuccessResponse(res, 200, "Inventory products fetched successfully", data);
});

export const getInventoryProductsPaginated = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, ...filter } = req.query;

    const locationId = req.user?.defaultLocationId;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await inventoryProductService.getInventoryProductsPaginated(
        filter,
        Number(locationId),
        Number(limit),
        offset
    );

    return SuccessResponse(res, 200, "Inventory products fetched successfully", result.data, {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
    });
});


export const assignbinInventoryProducts = catchAsync(async (req: AuthRequest, res: Response) => {

    const inventoryProduct = req.body;

    const affectedRows = await inventoryProductService.assignbinInventoryProducts(inventoryProduct);
    console.log(affectedRows);

    if (affectedRows === 0) {
        throw new AppError("No Inventory Products were updated. Check if IDs exist.", 404);
    }

    return SuccessResponse(res, 200, `${affectedRows} Inventory Products updated successfully.`, affectedRows);
}
);


export const updateInventoryProductCartStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { inventoryProductId } = req.params;
    const { isInCart } = req.body;

    if (typeof isInCart !== "boolean") {
        return res.status(400).json({ error: "`isInCart` must be true or false" });
    }

    const result = await inventoryProductService.updateInventoryProductCartStatus(Number(inventoryProductId), isInCart);

    return SuccessResponse(res, 200, "Inventory Product Cart status Updated successfully", result);
});

/**
 * Hold an inventory product
 */
export const holdInventoryProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const accountId = req.user?.accountId;

    if (!accountId) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const result = await inventoryProductService.holdInventoryProduct(Number(id), data, Number(accountId));

    return SuccessResponse(res, 200, "Inventory product placed on hold successfully", result);
});

/**
 * Unhold an inventory product
 */
export const unholdInventoryProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await inventoryProductService.unholdInventoryProduct(Number(id));

    return SuccessResponse(res, 200, "Hold removed successfully", result);
});

/**
 * Get hold details by hold ID
 */
export const getHoldById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { holdId } = req.params;

    const result = await inventoryProductService.getHoldById(Number(holdId));

    return SuccessResponse(res, 200, "Hold details fetched successfully", result);
});

/**
 * Create multiple holds on inventory products with a given customerId
 */
export const createBulkHolds = catchAsync(async (req: AuthRequest, res: Response) => {
    const { inventoryProductIds, customerId, note } = req.body;
    const accountId = req.user?.accountId;

    if (!accountId) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    if (!inventoryProductIds || !Array.isArray(inventoryProductIds) || inventoryProductIds.length === 0) {
        return res.status(400).json({ error: "inventoryProductIds array is required and must not be empty" });
    }

    if (!customerId) {
        return res.status(400).json({ error: "customerId is required" });
    }

    const result = await inventoryProductService.createBulkHolds(
        inventoryProductIds.map((id: any) => Number(id)),
        Number(customerId),
        { note },
        Number(accountId)
    );

    return SuccessResponse(res, 200, `Successfully created ${result.successfulCount} hold(s)`, result);
});

export const getInventoryProductsWithEmptyBin = catchAsync(async (req: AuthRequest, res: Response) => {
    const { productId } = req.query;

    const data = await inventoryProductService.getInventoryProductsWithEmptyBin(
        productId ? Number(productId) : undefined
    );

    return SuccessResponse(res, 200, "Inventory products with empty bin fetched successfully", data);
});

export const getInventoryProductByQrCode = catchAsync(async (req: AuthRequest, res: Response) => {
    const { qrCode } = req.params;

    if (!qrCode) {
        throw new AppError("QR code is required", 400);
    }

    const data = await inventoryProductService.getInventoryProductByQrCode(qrCode);

    return SuccessResponse(res, 200, "Inventory product details fetched successfully", data);
});


