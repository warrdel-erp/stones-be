import { Op, Transaction } from "sequelize";
import { LoadingOrder, Return, ReturnProduct, SalesOrderInvoice, SalesOrderProduct } from "../models";
import { RETURN_STATUS } from "../models/return.model";

export const createReturn = async (data: any, transaction: Transaction) => {
    return await Return.create(data, { transaction });
};

export const createReturnProducts = async (data: any[], transaction: Transaction) => {
    return await ReturnProduct.bulkCreate(data, { transaction });
};

export const getInvoiceWithProducts = async (invoiceId: number, transaction: Transaction) => {
    return await SalesOrderInvoice.findOne({
        where: { id: invoiceId },
        include: [
            {
                model: LoadingOrder,
                as: "loadingOrder",
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
    return await Return.update(data, {
        where: { id },
        transaction
    });
};

export const getReturnWithProducts = async (returnId: number) => {
    return await Return.findOne({
        where: { id: returnId },
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
                        association: 'loadingOrder',
                        include: [
                            {
                                association: 'packagingList'
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
    return await ReturnProduct.findOne({
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

export const getReturnById = async (returnId: number) => {
    return await Return.findByPk(returnId);
};

export const getAllReturnsPaginated = async (page: number, limit: number, clientId: number, filter?: any) => {
    const offset = (page - 1) * limit;
    return await Return.findAndCountAll({
        where: filter,
        include: [
            {
                association: 'soInvoice',
                where: { clientId },
                include: [
                    {
                        association: 'loadingOrder'
                    },
                    {
                        association: "customer",
                        attributes: ["id", "name", "primaryPhoneNumber", "secondaryPhoneNumber"],
                        include: [
                            {
                                association: "addresses",
                                attributes: ['address', 'city', 'state', 'addressType'],
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
                                attributes: ['id'],
                                include: [
                                    {
                                        association: 'slab',
                                        attributes: ['id', 'combinedSlabNumber']
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