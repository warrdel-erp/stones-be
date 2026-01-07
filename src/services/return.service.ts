import { sequelize } from "../config/database";
import * as returnRepository from "../repositories/return.repository";
import { AppError } from "../helper/appError";
import { RETURN_STATUS } from "../models/return.model";
import SalesOrderInvoice from "../models/salesOrderInvoice.model";
import Return from "../models/return.model";
import { ReturnProduct, SalesOrderProduct, Slab } from "../models";
import { Op } from "sequelize";
import * as slabRepository from "../repositories/slab.repository";
import * as genericProductRepository from "../repositories/genericProduct.repository";
import { Transaction } from "sequelize";
import { SALES_TAX, INVENTORY_ITEM_STATUS } from "../constants";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import { getTotalLoadingOrderAmount, getTotalPlAmount } from "./loadingOrder.service";
import * as journalEntryRepository from '../repositories/journalEntry.repository'
import * as ledgerAccountRepository from '../repositories/ledgerAccount.repository'
import { JOURNAL_ENTRY_FOR_TYPES, JOURNAL_ENTRY_PROCESS_TYPE, JOURNAL_ENTRY_REFERENCE_TYPES, JOURNAL_ENTRY_SUB_REFERENCE_TYPES, JOURNAL_ENTRY_TYPE, LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import { getPercentageValue } from "../helper";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as tradeServiceService from '../services/tradeService.service';
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";
import * as journalEntryServices from '../services/journalEntry.service'

interface InvoiceWithProducts {
    loadingOrder: {
        salesOrderProducts: Array<{
            id: number;
        }>;
    };
}

export const createReturn = async (invoiceId: number, productIds: number[], userId: number, services?: any[], clientId?: number) => {
    const transaction = await sequelize.transaction();

    try {
        // Get invoice with its products
        const invoice = await returnRepository.getInvoiceWithProducts(invoiceId, transaction);
        const invoiceData = invoice?.get({ plain: true }) as InvoiceWithProducts;

        if (!invoiceData) {
            throw new AppError("Invoice not found", 404);
        }

        // Check if given product ids not already exists in another return that is not canceled
        for (const salesOrderProductId of productIds) {
            const existingProduct: any = await returnRepository.checkExistingActiveReturns(salesOrderProductId);
            if (existingProduct) {
                throw new AppError(
                    `Sales order product with id ${salesOrderProductId} already returned or initiated for return in return Id ${existingProduct.return.id}`,
                    400
                );
            }
        }

        // Get all sales order product IDs from the invoice's loading order
        const validSalesOrderProductIds = invoiceData.loadingOrder.salesOrderProducts.map(
            (sop) => sop.id
        );

        // Check if all provided product IDs belong to this invoice
        const invalidProductIds = productIds.filter(
            (id) => !validSalesOrderProductIds.includes(id)
        );

        if (invalidProductIds.length > 0) {
            throw new AppError(
                `The following product IDs do not belong to this invoice: ${invalidProductIds.join(", ")}`,
                400
            );
        }

        // Create return record
        const returnRecord: any = await returnRepository.createReturn(
            {
                status: RETURN_STATUS.INITIATED,
                invoiceId,
                createdById: userId,
            },
            transaction
        );

        // Create trade services for return if they exist
        if (Array.isArray(services) && services.length && clientId) {
            await tradeServiceService.createMultipleTradeServices(
                services,
                TRADE_SERVICE_REFERENCE_TYPES.RETURN,
                returnRecord.id,
                clientId,
                "sale",
                transaction
            );
        }

        // Create return products
        const returnProducts = productIds.map((salesOrderProductId) => ({
            returnId: returnRecord.id,
            salesOrderProductId,
        }));

        await returnRepository.createReturnProducts(returnProducts, transaction);

        await transaction.commit();
        return returnRecord;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getReturnById = async (returnId: number, transaction?: Transaction) => {
    const returnRecord: any = (await returnRepository.getReturnWithProducts(returnId, transaction))?.get({ plain: true });

    const salesTax = returnRecord.soInvoice.loadingOrder.salesOrder.tax;

    if (!salesTax) {
        throw new AppError('Error in getting tax value', 400);
    }

    const salesOrderProducts = returnRecord.returnProducts.map((e: any) => e.salesOrderProduct);

    // Calculate total pl amount added in return.
    returnRecord.amounts = salesOrderProductRepository.getTotalsOfSalesOrderProducts(salesOrderProducts);

    return returnRecord;
}

export const confirmReturn = async (returnId: number, locationId: number, clientId: number, pTransaction?: Transaction) => {
    const transaction = pTransaction || await sequelize.transaction();
    const shouldCommit = !pTransaction;

    try {
        // Get return with its products
        const returnRecord: any = await getReturnById(returnId, transaction);

        const returnAmounts = returnRecord.amounts;

        if (!returnRecord) {
            throw new AppError("Return not found", 404);
        }

        if (returnRecord.status === RETURN_STATUS.CANCELLED) {
            throw new AppError("Cannot confirm a cancelled return", 400);
        }

        if (returnRecord.status === RETURN_STATUS.COMPLETE) {
            throw new AppError("Return is already confirmed", 400);
        }

        // Ledger Account for Customer
        const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
            referenceId: returnRecord.soInvoice.loadingOrder.salesOrder.customerId,
            referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
        });

        // Get ledger account for goods sold.
        const ledgerAccountForGoodsSold: any = await ledgerAccountRepository.getLedgerAccountByFilter({
            key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
            clientId,
        });

        // Journal entries for services attached with return. 
        await journalEntryServices.createJournalEntriesForTradeServicesOfReturns(returnRecord, locationId, transaction)
        // #1
        // Journal Entry for with tax.
        await journalEntryRepository.create(
            {
                amount: returnAmounts.final.total,
                ledgerId: ledgerAccount.id,
                type: JOURNAL_ENTRY_TYPE.CR,

                // reference
                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                referenceId: returnRecord.id,

                entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                entryForId: returnRecord.id,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
                locationId: returnRecord.soInvoice.loadingOrder.salesOrder.soLocationId,
                partyLedgerAccountId: ledgerAccountForGoodsSold.id,
            },
            transaction
        );

        // #2
        // Journal Entry for without tax.
        await journalEntryRepository.create(
            {
                amount: returnAmounts.final.total,
                ledgerId: ledgerAccountForGoodsSold.id,
                type: JOURNAL_ENTRY_TYPE.DR,

                // reference
                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                referenceId: returnRecord.id,

                entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                entryForId: returnRecord.id,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
                locationId: returnRecord.soInvoice.loadingOrder.salesOrder.soLocationId,
                partyLedgerAccountId: ledgerAccount.id,
            },
            transaction
        );

        // Get ledger account for State tax.
        const ledgerAccountForStateTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
            key: DEFAULT_LEDGER_ACCOUNT_KEYS.STATE_TAX,
            clientId,
        });

        // Get ledger account for State tax.
        const ledgerAccountForCountyTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
            key: DEFAULT_LEDGER_ACCOUNT_KEYS.COUNTY_TAX,
            clientId,
        });

        const customerTax = returnRecord.soInvoice.loadingOrder.salesOrder.tax;

        // #3
        // Journal Entry for state tax.
        await journalEntryRepository.create(
            {
                amount: getPercentageValue(returnAmounts.final.taxable, customerTax?.stateTax || 0),
                ledgerId: ledgerAccountForStateTax.id,
                type: JOURNAL_ENTRY_TYPE.DR,

                // reference
                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                referenceId: returnRecord.id,

                entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                entryForId: returnRecord.id,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
                locationId: returnRecord.soInvoice.loadingOrder.salesOrder.soLocationId,
                partyLedgerAccountId: ledgerAccount.id,
            },
            transaction
        );

        // Calculate county tax.
        const countyTax = customerTax?.value ? customerTax?.value - customerTax?.stateTax! : 0;

        // #4
        // Journal Entry for state tax.
        await journalEntryRepository.create(
            {
                amount: getPercentageValue(returnAmounts.final.taxable, countyTax),
                ledgerId: ledgerAccountForCountyTax.id,
                type: JOURNAL_ENTRY_TYPE.DR,

                // reference
                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                referenceId: returnRecord.id,

                entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                entryForId: returnRecord.id,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
                locationId: returnRecord.soInvoice.loadingOrder.salesOrder.soLocationId,
                partyLedgerAccountId: ledgerAccount.id,
            },
            transaction
        );

        // Get ledger account for finished goods.
        const ledgerAccountForFinishedGoods: any = await ledgerAccountRepository.getLedgerAccountByFilter({
            key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
            clientId,
        });


        // Get ledger account for finished cogs.
        const ledgerAccountForCogs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
            key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
            clientId,
        });

        // Update status of all products to IN_INVENTORY
        for (const returnProduct of returnRecord.returnProducts) {
            // Check if it's a slab or generic product
            let isSlabType = returnProduct.salesOrderProduct.inventoryProduct.isSlabType;

            // Update inventory product status to IN_INVENTORY
            await inventoryProductRepository.updateInventoryProductStatusById(
                returnProduct.salesOrderProduct.inventoryProductId,
                INVENTORY_ITEM_STATUS.IN_INVENTORY,
                transaction
            );

            // Create journal entries (only for slabs as they have landed unit cost)
            if (isSlabType) {
                const slabData = returnProduct.salesOrderProduct.inventoryProduct.slab;
                const inventoryProduct = returnProduct.salesOrderProduct.inventoryProduct;

                // #5
                await journalEntryRepository.create(
                    {
                        amount: slabData.receivedSqrFt * inventoryProduct.landedUnitCost,
                        ledgerId: ledgerAccountForFinishedGoods.id,
                        type: JOURNAL_ENTRY_TYPE.DR,

                        subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
                        subReferenceId: slabData.id,

                        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                        referenceId: returnRecord.id,

                        processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,

                        entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                        entryForId: returnRecord.id,

                        locationId: returnRecord.soInvoice.loadingOrder.salesOrder.soLocationId,
                        partyLedgerAccountId: ledgerAccountForCogs.id,
                    },
                    transaction
                );

                // #6
                await journalEntryRepository.create(
                    {
                        amount: slabData.receivedSqrFt * inventoryProduct.landedUnitCost,
                        ledgerId: ledgerAccountForCogs.id,
                        type: JOURNAL_ENTRY_TYPE.CR,

                        subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
                        subReferenceId: slabData.id,

                        referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                        referenceId: returnRecord.id,

                        processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,

                        entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                        entryForId: returnRecord.id,

                        locationId: returnRecord.soInvoice.loadingOrder.salesOrder.soLocationId,
                        partyLedgerAccountId: ledgerAccountForFinishedGoods.id,
                    },
                    transaction
                );
            }
        }

        // Update return status to COMPLETE
        await returnRepository.updateReturn(
            returnId,
            { status: RETURN_STATUS.COMPLETE },
            transaction
        );

        if (shouldCommit) {
            await transaction.commit();
        }
        return returnRecord;
    } catch (error) {
        if (shouldCommit) {
            await transaction.rollback();
        }
        throw error;
    }
};

export const cancelReturn = async (returnId: number) => {
    const transaction = await sequelize.transaction();

    try {
        // Get return record
        const returnRecord: any = await returnRepository.getReturnById(returnId);

        if (!returnRecord) {
            throw new AppError("Return not found", 404);
        }

        // Only initiated returns can be canceled
        if (returnRecord.status !== RETURN_STATUS.INITIATED) {
            throw new AppError("Only initiated returns can be canceled", 400);
        }

        // Update return status to CANCELLED
        await returnRepository.updateReturn(
            returnId,
            { status: RETURN_STATUS.CANCELLED },
            transaction
        );

        await transaction.commit();
        return returnRecord;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getAllReturnsPaginated = async (page: number, limit: number, clientId: number, filter: any) => {
    return await returnRepository.getAllReturnsPaginated(page, limit, clientId, filter);
};

export const updateReturnProductsAndConfirm = async (returnId: number, locationId: number, productIds: number[], clientId: number) => {
    const transaction = await sequelize.transaction();
    try {

        // 1. Get the return record and check status
        const returnRecord: any = await returnRepository.getReturnById(returnId);
        if (!returnRecord) {
            throw new AppError("Return not found", 404);
        }
        if (returnRecord.status !== RETURN_STATUS.INITIATED) {
            throw new AppError("Only initiated returns can be updated and confirmed", 400);
        }

        // Get invoice with its products
        // await validateProductsBelongsToGivenInvoice(returnRecord, transaction, productIds);

        // 2. Delete all previous ReturnProduct for this return (Because if less slabs are confirmed then initiated then remaining are not more in return)
        await returnRepository.deleteReturnProductsByReturnId(returnId, transaction);

        // 3. Create new ReturnProducts for the given productIds
        const newReturnProducts = productIds.map((salesOrderProductId) => ({
            returnId,
            salesOrderProductId,
        }));

        await returnRepository.createReturnProducts(newReturnProducts, transaction);

        // 4. Call confirmReturn with the transaction
        const confirmedReturn = await confirmReturn(returnId, locationId, clientId, transaction);

        await transaction.commit();

        return confirmedReturn;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

async function validateProductsBelongsToGivenInvoice(returnRecord: any, transaction: Transaction, productIds: number[]) {
    const invoice = await returnRepository.getInvoiceWithProducts(returnRecord.invoiceId, transaction);
    const invoiceData = invoice?.get({ plain: true }) as InvoiceWithProducts;

    if (!invoiceData) {
        throw new AppError("Invoice not found", 404);
    }

    // Check if given product ids not already exists in another return that is not canceled
    for (const salesOrderProductId of productIds) {
        const existingProduct: any = await returnRepository.checkExistingActiveReturns(salesOrderProductId);
        if (existingProduct) {
            throw new AppError(
                `Sales order product with id ${salesOrderProductId} already returned or initiated for return in return Id ${existingProduct.return.id}`,
                400
            );
        }
    }

    // Get all sales order product IDs from the invoice's loading order
    const validSalesOrderProductIds = invoiceData.loadingOrder.salesOrderProducts.map(
        (sop) => sop.id
    );

    // Check if all provided product IDs belong to this invoice
    const invalidProductIds = productIds.filter(
        (id) => !validSalesOrderProductIds.includes(id)
    );

    if (invalidProductIds.length > 0) {
        throw new AppError(
            `The following product IDs do not belong to this invoice: ${invalidProductIds.join(", ")}`,
            400
        );
    }
}
