import * as model from "../models/index.js";
import { Op } from "sequelize";

export async function getSlabDetailByInvoiceMapper(poSupplierInvoiceMappperId) {
    const res = await model.poSupplierInvoiceMapperModel.findOne({
        include:[
            {
                model:model.poSupplierInvoiceModel,
                as:'supplierInvoice',
                attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
                include:[
                    {
                        model:model.poSlabDetails,
                        as:'slabDetails',
                        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt','status'] },
                    }
                ]
            },
        ],
        where:{
            poSupplierInvoiceMappperId
        }
    })
    return res
}