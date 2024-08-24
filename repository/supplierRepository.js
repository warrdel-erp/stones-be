import * as model from '../models/index.js'
import { Op } from 'sequelize';


export async function addSupplier(data) {
    try {
        const result = await model.supplierModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in addSupplier:", error);
        throw error;
    }
}

export async function getAllSupplierName(data) {
    let result;
    try {
        if (data.search !== 'all') {
            result = await model.supplierModel.findAll({
                where: {
                    supplier_name: {
                        [Op.like]: `%${data.search}%`
                    }
                },
            });
        } else {
            result = await model.supplierModel.findAll({
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

// get single supplier details by id
export async function getSupplerBySupplierId(supplierId) {
    try {
        const result = await model.supplierModel.findOne({
            where: {
                supplierId: supplierId
            }
        });
        return result;
    } catch (error) {
        console.error(`Error in getting supplier${supplierId}:`, error);
        throw error;
    }
}