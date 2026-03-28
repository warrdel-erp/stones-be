import * as vendorContactRepository from "../repositories/vendorContact.repository";
import * as vendorRepository from "../repositories/vendor.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";

/**
 * Create a new vendor contact
 */
export const createVendorContact = async (data: any, clientId: number) => {
    // Validate vendor exists and belongs to client
    const vendor: any = await vendorRepository.findVendorById(data.vendorId);
    if (!vendor) {
        throw new AppError("Vendor not found", 404);
    }

    if (vendor.clientId !== clientId) {
        throw new AppError("Vendor does not belong to your client", 403);
    }

    const transaction = await sequelize.transaction();
    try {
        // If this is set as primary, reset others
        if (data.isPrimary) {
            await vendorContactRepository.resetPrimaryContacts(data.vendorId, transaction);
        }

        const contact = await vendorContactRepository.createVendorContact({ ...data, clientId }, transaction);
        await transaction.commit();
        return contact;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Update vendor contact
 */
export const updateVendorContact = async (id: number, data: any, clientId: number) => {
    const contact: any = await vendorContactRepository.findVendorContactById(id);
    if (!contact) {
        throw new AppError("Contact not found", 404);
    }

    if (contact.clientId !== clientId) {
        throw new AppError("Contact does not belong to your client", 403);
    }

    const transaction = await sequelize.transaction();
    try {
        // If setting this as primary, reset others
        if (data.isPrimary) {
            await vendorContactRepository.resetPrimaryContacts(contact.vendorId, transaction);
        }

        await vendorContactRepository.updateVendorContact(id, data, transaction);
        await transaction.commit();

        return await vendorContactRepository.findVendorContactById(id);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Delete vendor contact
 */
export const deleteVendorContact = async (id: number, clientId: number) => {
    const contact: any = await vendorContactRepository.findVendorContactById(id);
    if (!contact) {
        throw new AppError("Contact not found", 404);
    }

    if (contact.clientId !== clientId) {
        throw new AppError("Contact does not belong to your client", 403);
    }

    // Don't allow deleting the primary contact if it's the only one?
    // User didn't specify, but often primary is required.

    await vendorContactRepository.deleteVendorContact(id);
    return { message: "Contact deleted successfully" };
};

/**
 * Get all vendor contacts
 */
export const getAllVendorContacts = async (page: number, limit: number, filter: any = {}) => {
    return await vendorContactRepository.getAllVendorContacts(page, limit, filter);
};

/**
 * Get contacts for a specific vendor
 */
export const getContactsByVendorId = async (vendorId: number) => {
    return await vendorContactRepository.findContactsByVendorId(vendorId);
};
