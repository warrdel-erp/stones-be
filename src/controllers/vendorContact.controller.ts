import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";
import { AppError } from "../helper/appError";
import * as vendorContactService from "../services/vendorContact.service";

/**
 * Controller to handle vendor contact creation.
 */
export const createVendorContactController = catchAsync(async (req: AuthRequest, res: Response) => {
    const contactData = req.body;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    const newContact = await vendorContactService.createVendorContact({ ...contactData, clientId }, Number(clientId));

    return SuccessResponse(res, 201, "Vendor contact created successfully.", newContact);
});

/**
 * Controller to handle vendor contact update.
 */
export const updateVendorContactController = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    const updatedContact = await vendorContactService.updateVendorContact(Number(id), data, Number(clientId));

    return SuccessResponse(res, 200, "Vendor contact updated successfully", updatedContact);
});

/**
 * Controller to handle vendor contact deletion.
 */
export const deleteVendorContactController = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const clientId = req.user?.clientId;

    if (!clientId) {
        throw new AppError("ClientId is missing from user authentication", 401);
    }

    const result = await vendorContactService.deleteVendorContact(Number(id), Number(clientId));

    return SuccessResponse(res, 200, "Vendor contact deleted successfully", result);
});

/**
 * Controller to fetch all vendor contacts with pagination and basic filters.
 */
export const getAllVendorContactsController = catchAsync(async (req: AuthRequest, res: Response) => {
    let { page, limit, ...filter }: any = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const result = await vendorContactService.getAllVendorContacts(page, limit, filter);

    return SuccessResponse(res, 200, "Vendor contacts retrieved successfully", result.data, {
        total: result.total,
        page: result.page,
        limit: result.limit,
    });
});

/**
 * Controller to fetch contacts for a specific vendor.
 */
export const getContactsByVendorIdController = catchAsync(async (req: AuthRequest, res: Response) => {
    const { vendorId } = req.params;

    const contacts = await vendorContactService.getContactsByVendorId(Number(vendorId));

    return SuccessResponse(res, 200, "Vendor contacts fetched successfully", contacts);
});
