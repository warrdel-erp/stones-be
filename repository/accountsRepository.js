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

export async function updateAccount(accountsId, data) {
    try {
        const result = await model.accountsModel.update(data, {
            where: {
                accountsId: accountsId
            }
        });
        return result;
    } catch (error) {
        console.error(`Error updating account ${accountsId} :`, error);
        throw error;
    }
}

export async function deleteAccount(accountsId) {
    try {
        const result = await model.accountsModel.destroy({
            where: { accountsId },
            individualHooks: true
        });
        return { message: 'Account deleted successfully' };
    } catch (error) {
        console.error('Error during soft delete:', error);
        throw new Error('Unable to soft delete account');
    }
};

export async function findAccountNumber(accountId) {
    const result = await model.accountsModel.findOne({
        where: {
            accountsId: {
                [Op.eq]: accountId
            }
        }
    })
    return result;
};





export async function getCashFinancialAssestOptions() {
    const result = await model.subAccountTypesModel.findAll({
        where: {
            subAccountType: 'Cash and Financial Assets',   
        },
        attributes:['subAccountType','subAccountTypesId','accountTypesId'],
        include:[
            {
                model:model.accountsModel,
                as:'accountSubtype',
                attributes:['accountsId','subAccountTypesId','accountName','accountTypesId','accountBalance']
            }
        ]
    })
    return result;
};

export async function getGroupedAccountList() {
    const result = await model.subAccountTypesModel.findAll({
        attributes:['subAccountType','subAccountTypesId','accountTypesId'],
        include:[
            {
                model:model.accountsModel,
                as:'accountSubtype',
                attributes:['accountsId','subAccountTypesId','accountName','accountTypesId','accountBalance'],
            },
            {
                model:model.accountTypesModel,
                as:'accountTypeSubtype',
                attributes:['accountType','accountTypesId']
            }
        ]
    })
    return result;
};



export async function getAccountIdByAccountName(data) {
    const result = await model.subAccountTypesModel.findAll({
        attributes:['subAccountType','subAccountTypesId','accountTypesId'],
        include:[
            {
                model:model.accountsModel,
                as:'accountSubtype',
                attributes:['accountsId','subAccountTypesId','accountName','accountTypesId','accountBalance'],
            },
            {
                model:model.accountTypesModel,
                as:'accountTypeSubtype',
                attributes:['accountType','accountTypesId']
            }
        ]
    })
    return result;
};

// getAccountIdByAccountName(data);

