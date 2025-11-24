import { AdvancedDeposit } from "../models"

export const getAdvancedDepositWithoutPagination = (filters: Record<string, string>) => {
    return AdvancedDeposit.findAll({
        where: filters,
        include: [
            {
                association: 'ledgerAccount',
                attributes: ['id', 'name']
            },
            {
                association: 'payment',
                attributes: ['id', 'paymentMethod']
            },
            {
                association: 'salesOrder',
                attributes: ['id', "clientSoNumber", 'customerId']
            },
            {
                association: 'settlements',
                attributes: ['id', 'amount']
            }
        ]
    })
}