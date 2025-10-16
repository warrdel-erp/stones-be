import { Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AuthRequest } from "../middleware/authMiddleware";
import * as inventoryProductService from "../services/inventoryProduct.service";

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
        data = await inventoryProductService.getInventoryProductsBySIPLCombinedNumber(Number(siplId));
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


export const getInventoryProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    const filter = req.query;

    const locationId = req.user?.defaultLocationId

    const data = await inventoryProductService.getInventoryProducts(filter as Record<string, string>, Number(locationId));

    return SuccessResponse(res, 200, "Inventory products fetched successfully", data);
});

export const updateInventoryProductCartStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { inventoryProductId } = req.params;
    const { isInCart } = req.body;

    if (typeof isInCart !== "boolean") {
        return res.status(400).json({ error: "`isInCart` must be true or false" });
    }

    const result = await inventoryProductService.updateInventoryProductCartStatus(Number(inventoryProductId), isInCart);

    return SuccessResponse(res, 200, "Inventory Product Cart status Updated successfully", result);
});

export const getCartCount = catchAsync(async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;

    if (!clientId) {
        return res.status(401).json({ error: "Missing client information" });
    }

    const result = await inventoryProductService.getCartCount(clientId);
    return SuccessResponse(res, 200, "Cart count retrieved successfully", result);
});

export const updateInventoryProductHoldStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isHold } = req.body;

    if (typeof isHold !== "boolean") {
        return res.status(400).json({ error: "`isHold` must be true or false" });
    }

    const result = await inventoryProductService.updateInventoryProductHoldStatus(Number(id), isHold);

    SuccessResponse(res, 200, "Slab Hold status Updated successfully", result);
});