import * as model from '../models/index.js';
import { Op } from "sequelize";

export async function addAccount(data) {
    try {
        const result = await model.accountsModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in add Account:", error);
        throw error;
    }
};

// get all account type and account sub type

export async function getAllTypeSubTypes() {
    try {
        const result = await model.accountTypesModel.findAll({
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status", "accountTypesId"] },
            include: [
                {
                    model: model.subAccountTypesModel,
                    as: "accountTypeSubtype",
                    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                },
            ],
        });
        return result;
    } catch (error) {
        console.error("Error in get account details:", error);
        throw error;
    }
};

//get all account details

export async function getAllAccounts(searchText) {
    try {
        let result;
        if (searchText) {
            result = await model.accountsModel.findAll({
                attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                  where: {
                    accountName: { [Op.like]: `%${searchText}%` },
                  },
                include: [
                    {
                        model: model.subAccountTypesModel,
                        as: "accountSubtype",
                        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                        //   where: {
                        //     subAccountType: { [Op.like]: `%${searchText}%` },
                        //   },
                        include: {
                            model: model.accountTypesModel,
                            as: "accountTypes",
                            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                            // where: {
                            //     accountType: { [Op.like]: `%${searchText}%` },
                            // },
                        },
                    },
                ],
                order: [['createdAt', 'DESC']]
            });
        } else {
            console.log('No search text provided');
            result = await model.accountsModel.findAll({
                attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                include: [
                    {
                        model: model.subAccountTypesModel,
                        as: "accountSubtype",
                        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                        include: {
                            model: model.accountTypesModel,
                            as: "accountTypes",
                            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                        },
                    },
                ],
                order: [['createdAt', 'DESC']]
            });
        }
        return result;
    } catch (error) {
        console.error(`Error in getting account details ${searchText}:`, error);
        throw error;
    }
};