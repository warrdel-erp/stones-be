import * as model from '../models/index.js'

export async function addSupplier(data) {
    try {
        const result = await model.supplierModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in addSupplier:", error);
        throw error;
    }
}

export async function getAllSupplierName() {
    try {
        const result = await model.supplierModel.findAll();
        return result;
    } catch (error) {
        console.error("Error in getAllSupplier:", error);
        throw error;
    }
}

export async function getSingleSupplier(supplierName) {
    try {
        const result = await model.supplierModel.findOne({
            where: {
                supplier_name: supplierName
            }
        });
        return result;
    } catch (error) {
        console.error(`Error in ${supplierName}:`, error);
        throw error;
    }
}

export async function updateSupplier(supplierName, data) {
    try {
        const result = await model.supplierModel.update(data, {
            where: {
                supplierName: supplierName
            }
        });
     return result; 
    } catch (error) {
        console.error("Error updating Supplier:", error);
        throw error; 
    }
}