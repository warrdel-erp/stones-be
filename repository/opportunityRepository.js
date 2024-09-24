import * as model from '../models/index.js';
import { Op } from "sequelize";


//create opportunity
export async function addOpportunity(data) {
    try {
        const result = await model.opportunityModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in add Account:", error);
        throw error;
    }
};


//get opportunity number
export async function getOpportunityNumber(clientId) {
    try {
        const result = (await model.opportunityModel.findAll({})).length;
        return result;
    } catch (error) {
        console.error("Error in get opportunityDetails", error);
        throw error;
    }
};

// get all account type and account sub type
export async function getAllOpportunity(data) {
    try {
        const result = await model.opportunityModel.findAll({
            include: {
                model: model.clientUserModel,
                as: 'clientDetails',
                attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                where: {
                    clientId: data.clientId
                }
            },
            order: [['createdAt', 'DESC']]
        });
        return result;
    } catch (error) {
        console.error("Error in get opportunityDetails", error);
        throw error;
    }
};



//create selection sheet for opportunity
export async function createSelectionSheet(data) {
    try {
        const result = await model.opportunitySelectionModel.create(data);
        return result;
    } catch (error) {
        console.error("Error in add Account:", error);
        throw error;
    }
};

//get single opportunity details page

export async function getOpportunityDetails(data) {
    try {
        const result = await model.opportunityModel.findOne({
            where: {
                opportunityId: data.opportunityId
            },
            include: [
                {
                    model: model.clientUserModel,
                    as: 'clientDetails',
                    attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                    where: {
                        clientId: data.clientId
                    }
                },
                {
                    model: model.customerModel,
                    as: 'customerDetails'
                },
                {
                    model: model.opportunitySelectionModel,
                    as: 'oppSelectionSheet',
                    include: [
                        {
                            model: model.poSlabDetails,
                            as: 'slabsDetails',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
                        },
                        {
                            model: model.productInventoryModel,
                            as: 'inventrory',
                            attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                            include: [
                                {
                                    model: model.productModel,
                                    attributes: ['productName'],
                                    as: 'salesProductDetails'
                                }
                            ]
                        }
                    ]
                }
            ],

        });
        return result;
    } catch (error) {
        console.error("Error in get opportunityDetails", error);
        throw error;
    }
};


export async function lasteSelectionSheetNumber(data) {
    try {
        const result = await model.opportunitySelectionModel.findOne({
            where: {
                opportunityId: data.opportunityId
            },
            order: [['selectionSheetId', 'DESC']]
        });

        return result;
    } catch (error) {
        console.error("Error in add Account:", error);
        throw error;
    }
};


//get product inventory
export async function getInventoryList(page, limit, clientId) {
    try {
        const offset = page * limit;
        console.log(`Fetching inventory with limit: ${limit}, offset: ${offset}`);

        const result = await model.productInventoryModel.findAll({
            where: {
                status: 'ACTIVE'
            },
            // offset: offset,
            // limit: limit,
            include: [
                {
                    model: model.clientUserModel,
                    as: 'clientDetails',
                    attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
                    where: {
                          clientId: clientId
                    }
                },
                {
                    model: model.inventoryInvoiceMapper,
                    as: "productInventoryInvoiceMapper",
                    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
                    include: [
                        {
                            model: model.poSupplierInvoiceModel,
                            as: "productInventoryInvoice",
                            attributes: {
                                exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
                            },
                            include: [
                                {
                                    model: model.poSupplierInvoiceMapperModel,
                                    attributes: {
                                        exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
                                    },
                                    as: 'transactionData',
                                },
                                {
                                    model: model.poSlabDetails,
                                    as: "slabDetails",
                                    where: {
                                        status: {
                                            [Op.in]: ['ACTIVE', 'RETURNED']
                                        },
                                        // addedToSelectionSheet: {
                                        //     [Op.eq]: 0
                                        // }
                                    },
                                    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                                },
                                {
                                    model: model.purchaseProductModel,
                                    as: "supplierPurchaseProduct",
                                    attributes: {
                                        exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
                                    },
                                    include: [
                                        {
                                            model: model.productModel,
                                            as: "products",
                                            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],

                },
            ],
        });
        console.log(JSON.stringify(result), 'invet');
        console.log(`Fetched getInventoryList ${result.length} records`);
        return result;
    } catch (error) {
        console.error("Error in getInventoryList:", error);
        throw error;
    }
}


//get selection sheet details


export async function getSelectionSheetDetails(selectionSheetId) {
    console.log(selectionSheetId,'losjsj');
    
    try {
        const result = await model.opportunitySelectionModel.findAll({
            where: {
                selectionSheetId: selectionSheetId
            },
            include: [
                {
                    model: model.poSlabDetails,
                    as: 'slabsDetails',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
                },
                {
                    model: model.productInventoryModel,
                    as: 'inventrory',
                    attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
                    include: [
                        {
                            model: model.productModel,
                            as: 'salesProductDetails',
                            attributes: ['productName']
                        }
                    ]
                }
            ]
        });
        return result;
    } catch (error) {
        console.error("Error in get Opportunity Details:", error);
        throw error;
    }
}
