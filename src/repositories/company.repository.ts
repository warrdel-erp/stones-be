import { Transaction } from "sequelize";
import Company from "../models/company.model";

export const createCompany = async (companyData: any, transaction?: Transaction) => {
    return await Company.create(companyData, { transaction });
};

export const getCompanyByClientId = async (clientId: number) => {
    return await Company.findOne({
        where: { clientId },
    });
};

export const updateCompany = async (clientId: number, updateData: any, transaction?: Transaction) => {
    const [updatedRows] = await Company.update(updateData, {
        where: { clientId },
        transaction,
    });
    if (updatedRows === 0) return null;
    return await getCompanyByClientId(clientId);
}; 