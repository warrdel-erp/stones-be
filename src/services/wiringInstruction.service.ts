import * as wiringInstructionRepository from "../repositories/wiringInstruction.repository";
import * as vendorRepository from "../repositories/vendor.repository";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";

/**
 * Create a new wiring instruction
 */
export const createWiringInstruction = async (data: any, clientId: number, accountId: number) => {
    // Validate vendor exists and belongs to client
    const vendor: any = await vendorRepository.findVendorById(data.vendorId);
    if (!vendor) {
        throw new AppError("Vendor not found", 404);
    }

    if (vendor.clientId !== clientId) {
        throw new AppError("Vendor does not belong to your client", 403);
    }

    const wiringInstruction = await wiringInstructionRepository.createWiringInstruction({
        ...data,
        clientId,
        createdBy: accountId,
        updatedBy: accountId
    });

    return wiringInstruction;
};

/**
 * Update wiring instruction
 */
export const updateWiringInstruction = async (id: number, data: any, clientId: number, accountId: number) => {
    const instruction: any = await wiringInstructionRepository.findWiringInstructionById(id);
    if (!instruction) {
        throw new AppError("Wiring instruction not found", 404);
    }

    if (instruction.clientId !== clientId) {
        throw new AppError("Wiring instruction does not belong to your client", 403);
    }

    await wiringInstructionRepository.updateWiringInstruction(id, { ...data, updatedBy: accountId });

    return await wiringInstructionRepository.findWiringInstructionById(id);
};

/**
 * Delete wiring instruction
 */
export const deleteWiringInstruction = async (id: number, clientId: number) => {
    const instruction: any = await wiringInstructionRepository.findWiringInstructionById(id);
    if (!instruction) {
        throw new AppError("Wiring instruction not found", 404);
    }

    if (instruction.clientId !== clientId) {
        throw new AppError("Wiring instruction does not belong to your client", 403);
    }

    await wiringInstructionRepository.deleteWiringInstruction(id);
    return { message: "Wiring instruction deleted successfully" };
};

/**
 * Get all wiring instructions with pagination
 */
export const getAllWiringInstructions = async (page: number, limit: number, clientId: number, filter: any = {}) => {
    return await wiringInstructionRepository.getAllWiringInstructions(page, limit, { ...filter, clientId });
};

/**
 * Find wiring instruction by ID
 */
export const findWiringInstructionById = async (id: number, clientId: number) => {
    const instruction: any = await wiringInstructionRepository.findWiringInstructionById(id);
    if (!instruction) {
        throw new AppError("Wiring instruction not found", 404);
    }

    if (instruction.clientId !== clientId) {
        throw new AppError("Wiring instruction does not belong to your client", 403);
    }

    return instruction;
};
