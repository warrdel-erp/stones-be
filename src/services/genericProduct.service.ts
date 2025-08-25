import { Transaction } from "sequelize";
import * as genericProductRepository from "../repositories/genericProductRepository";

// Get all generic products
export const fetchAllGenericProducts = async (filters?: any, transaction?: Transaction, locationId?: number) => {
    return await genericProductRepository.getAllGenericProducts(filters, transaction, locationId);
}; 