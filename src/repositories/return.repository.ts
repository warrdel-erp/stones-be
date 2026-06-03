import { Op, Transaction } from "sequelize";
import { PackagingList, Return, ReturnProduct, SalesOrderInvoice, SalesOrderProduct } from "../models";
import { RETURN_STATUS } from "../models/return.model";
import { scoped } from "../utils/scoped";

export const createReturn = async (data: any, transaction: Transaction) => {
    return await scoped(Return).create(data, { transaction });
};

export const createReturnProducts = async (data: any[], transaction: Transaction) => {
    return await scoped(ReturnProduct).bulkCreate(data, { transaction });
};

export const getInvoiceWithProducts = async (invoiceId: number, transaction: Transaction) => {
    return await scoped(SalesOrderInvoice).findOne({
        where: { id: invoiceId },
        include: [
            {
                model: PackagingList,
                as: "packagingList",
                include: [
                    {
                        model: SalesOrderProduct,
                        as: "salesOrderProducts",
                    },
                ],
            },
        ],
        transaction,
    });
};

export const updateReturn = async (id: number, data: any, transaction: Transaction) => {
    return await scoped(Return).update(data, {
        where: { id },
        transaction
    });
};

export const getReturnWithProducts = async (returnId: number, transaction?: Transaction) => {
    return await scoped(Return).findOne({
        where: { id: returnId },
        transaction,
        include: [
            {
                association: 'returnProducts',
                include: [
                    {
                        association: 'salesOrderProduct',
                        include: [
                            {
                                association: 'inventoryProduct',
                                include: [
                                    {
                                        association: 'slab'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                association: 'soInvoice',
                include: [
                    {
                        association: 'packagingList',
                        include: [
                            {
                                association: 'loadingOrder'
                            },
                            {
                                association: 'salesOrder',
                                include: [
                                    {
                                        association: 'customer'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    });
};

export const checkExistingActiveReturns = async (salesOrderProductId: number) => {
    return await scoped(ReturnProduct).findOne({
        where: {
            salesOrderProductId
        },
        include: [
            {
                association: 'return',
                required: true,
                where: {
                    status: {
                        [Op.ne]: RETURN_STATUS.CANCELLED
                    }
                }
            }
        ]
    });
};

export const getReturnById = async (returnId: number, transaction?: Transaction) => {
    return await Return.findByPk(returnId, { transaction });
};

export const getAllReturnsPaginated = async (page: number, limit: number, clientId: number, filter?: any) => {
    const offset = (page - 1) * limit;
    return await scoped(Return).findAndCountAll({
        where: filter,
        include: [
            {
                association: 'soInvoice',
                where: { clientId },
                include: [
                    {
                        association: 'packagingList',
                        attributes: ['id', 'code'],
                        include: [
                            {
                                association: 'loadingOrder',
                                attributes: ['id', 'code'],
                            }
                        ]
                    },
                    {
                        association: "customer",
                        attributes: ["id", "name", "primaryPhoneNumber", "secondaryPhoneNumber"],
                        include: [
                            {
                                association: "addresses",
                                attributes: ['address', 'addressType'],
                            },
                        ],
                    },
                ]
            },
            {
                association: 'returnProducts',
                include: [
                    {
                        association: 'salesOrderProduct',
                        attributes: ['id'],
                        include: [
                            {
                                association: "inventoryProduct",
                                attributes: ['id', 'combinedNumber'],
                                include: [
                                    {
                                        association: 'slab',
                                        attributes: ['id']
                                    }
                                ]
                            }

                        ]
                    },
                ]
            }
        ],
        offset,
        limit,
        order: [['createdAt', 'DESC']],
    });
};

export const deleteReturnProductsByReturnId = async (returnId: number, transaction: Transaction) => {
    return await scoped(ReturnProduct).destroy({ where: { returnId }, transaction });
}; 