
import * as freightBillRepository from '../repository/freightRepository.js'
import sequelize from '../database/sequelizeConfig.js';
import { getAccountIdByAccountName } from './accountsServices.js';
import * as purchaseOrderRepository from '../repository/purchaseOrderRepository.js'
import * as slabpurchaseOrderRepository from '../repository/supplierInvoiceMapperRepository.js';

export async function addFreightBill(info) {

    const transaction = await sequelize.transaction();
    try {
        const accNames = { creditAccountName: 'Freight Payables ', debitAccountName: 'Inventory in Transit' };
        const transactionAccountId = await getAccountIdByAccountName(accNames);

        const accountDetails = [
            { accountsId: transactionAccountId.debitAccount.accountId, entryType: 'dr' },
            { accountsId: transactionAccountId.creditAccount.accountId, entryType: 'cr' }
        ];
        for (const accountDetail of accountDetails) {
            const transactionDataWithAccount = {
                accountsId: accountDetail.accountsId,
                entryType: accountDetail.entryType,
                transactionOf: 'purchase',
                transactionAmountType: 'debit',
                transactionAmount: info.freightBillData.total,
                transactionAmountDate: new Date(),
                createdBy: info.createdBy,
                poSupplierInvoiceMapperId: info.freightBillData.poSupplierInvoiceMapperId,
                vendorId: info.freightBillData.vendorId
            };
            await purchaseOrderRepository.purchaseAccountTransaction(transactionDataWithAccount, transaction);
        }
        await purchaseOrderRepository.siplTransactionStatusUpdate({
            poSupplierInvoiceMappperId: info.freightBillData.poSupplierInvoiceMapperId,
            transactionStatus: 'FREIGHT ADDED'
        });
        const freightCreate = await freightBillRepository.addFreightBill(info.freightBillData, transaction);
        const freightBillsId = freightCreate.dataValues.freightBillsId;
        const createdFreightBillDetails = [];
        for (const detail of info.freightBillDetails) {
            const freightDetail = {
                ...detail,
                freightBillsId
            };
            const createdDetail = await freightBillRepository.addFreightBillDetails(freightDetail, transaction);
            createdFreightBillDetails.push(createdDetail);
        }
        await transaction.commit();
        console.log('Freight bill and details created successfully.');
        return {
            freightBill: freightCreate,
            freightBillDetails: createdFreightBillDetails
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating freight bill:', error);
        throw error;
    }
}


//get freigh data 
export async function getFreightData(data) {
    try {
        let slabDetails = {}
        if (data.poSupplierInvoiceMapperId) {
            slabDetails = await slabpurchaseOrderRepository.getSlabDetailByInvoiceMapper(data.poSupplierInvoiceMapperId);
        }

        const freightBill = await freightBillRepository.getFreightData(data);

        return { freightBill, slabDetails };
    } catch (error) {
        console.error('Error fetching freight details:', error);
        throw error;
    }
}


export async function getFreightAccounts(data) {
    try {
        // Fetch freight account data
        const freightBill = await freightBillRepository.getFreightAccounts(data);


        return freightBill;
    } catch (error) {
        console.error('Error fetching freight details:', error);
        throw error;
    }
}

