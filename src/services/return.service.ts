import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { INVENTORY_ITEM_STATUS } from "../constants";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import { ACTIVITY_REFERENCE_TYPE, ACTIVITY_TYPE, CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES, CREDIT_DEBIT_NOTE_TYPES, CREDIT_NOTE_REFERENCE_TYPES, JOURNAL_ENTRY_FOR_TYPES, JOURNAL_ENTRY_PROCESS_TYPE, JOURNAL_ENTRY_REFERENCE_TYPES, JOURNAL_ENTRY_SUB_REFERENCE_TYPES, JOURNAL_ENTRY_TYPE, LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import { getPercentageValue } from "../helper";
import * as decimal from "../helper/decimal";
import { AppError } from "../helper/appError";
import { RETURN_STATUS } from "../models/return.model";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as journalEntryRepository from '../repositories/journalEntry.repository';
import * as ledgerAccountRepository from '../repositories/ledgerAccount.repository';
import * as returnRepository from "../repositories/return.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as paymentBillRepository from "../repositories/paymentBills.repository";
import * as creditDebitNoteRepository from "../repositories/creditDebitNote.repository";
import * as activityService from "../services/activity.service";
import * as journalEntryServices from '../services/journalEntry.service';
import * as ledgerAccountService from '../services/ledgerAccount.service';
import * as tradeServiceService from '../services/tradeService.service';
import { requestContext } from "../utils/requestContext";

interface InvoiceWithProducts {
    packagingList?: {
        salesOrderProducts: Array<{
            id: number;
        }>;
    };
    loadingOrder?: {
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

        // Get all sales order product IDs from the invoice's packaging list or loading order
        const validSalesOrderProducts =
            invoiceData.packagingList?.salesOrderProducts ||
            invoiceData.loadingOrder?.salesOrderProducts ||
            [];
        const validSalesOrderProductIds = validSalesOrderProducts.map(
            (sop: any) => sop.id
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

        await activityService.logActivity({
            clientId: clientId || requestContext.getStore()?.clientId || 0,
            activityType: ACTIVITY_TYPE.RETURN_INITIATION,
            referenceId: returnRecord.id,
            referenceType: ACTIVITY_REFERENCE_TYPE.RETURN,
            title: "Return Initiated",
            description: `Return initiated for Sales Invoice #${invoiceId}.`,
        }, transaction);

        await transaction.commit();
        return returnRecord;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getReturnById = async (returnId: number, transaction?: Transaction) => {
    const returnRecord: any = (await returnRepository.getReturnWithProducts(returnId, transaction))?.get({ plain: true });

    const salesOrder = returnRecord.soInvoice.packagingList?.salesOrder || returnRecord.soInvoice.loadingOrder?.salesOrder;
    const salesTax = salesOrder?.tax;

    if (!salesTax) {
        throw new AppError('Error in getting tax value', 400);
    }

    const salesOrderProducts = returnRecord.returnProducts.map((e: any) => e.salesOrderProduct);
    const discountPercentage = returnRecord.soInvoice?.discountPercentage ?? salesOrder?.discountPercentage;

    // Calculate total pl amount added in return.
    returnRecord.amounts = salesOrderProductRepository.getTotalsOfSalesOrderProducts(
        salesOrderProducts,
        discountPercentage,
        salesTax?.value || salesOrderProducts[0]?.taxPercentage || 0
    );

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

        const salesOrder = returnRecord.soInvoice.packagingList?.salesOrder || returnRecord.soInvoice.loadingOrder?.salesOrder;
        const customerId = salesOrder?.customerId;
        const soLocationId = salesOrder?.locationId || locationId;
        const invoiceId = returnRecord.invoiceId;
        const invoiceFinalAmount = Number(returnRecord.soInvoice?.finalAmount || 0);
        const returnTotal = Number(returnAmounts.final.total || 0);
        const returnTaxable = Number(returnAmounts.final.taxable || 0);

        // Check invoice settlement breakdown to determine if customer has paid (Scenario 2E) or unpaid (Scenario 2D)
        const settlementBreakdown = await paymentBillRepository.getInvoiceSettlementBreakdown(
            invoiceId,
            invoiceFinalAmount
        );

        // Remaining unpaid balance on invoice before this return
        const remainingUnpaidBalance = Math.max(
            0,
            Number(decimal.decimalSubtract(invoiceFinalAmount, settlementBreakdown.totalSettled))
        );

        let arPortion = 0;
        let refundPortion = 0;

        if (remainingUnpaidBalance >= returnTotal) {
            // Scenario 2D: Entire return offsets unpaid invoice AR balance
            arPortion = returnTotal;
            refundPortion = 0;
        } else if (remainingUnpaidBalance > 0) {
            // Partial: Unpaid portion offsets AR, remainder was already paid -> refund liability
            arPortion = remainingUnpaidBalance;
            refundPortion = Number(decimal.decimalSubtract(returnTotal, remainingUnpaidBalance));
        } else {
            // Scenario 2E: Invoice already fully settled/paid -> entire return is refund liability
            arPortion = 0;
            refundPortion = returnTotal;
        }

        // Ledger Account for Customer AR
        const ledgerAccount: any = await ledgerAccountRepository.getLedgerAccountByFilter({
            referenceId: customerId,
            referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER,
    }, transaction);

    // Customer Refund Payable ledger account (for paid portion / Scenario 2E)
    let ledgerAccountForRefundPayable: any = null;
    if (refundPortion > 0) {
        ledgerAccountForRefundPayable = await ledgerAccountService.getOrCreateCustomerRefundPayableLedgerAccount(
            clientId,
            transaction
        );
    }

    // Get or create ledger account for Sales Returns & Allowances (Contra-Revenue).
    let ledgerAccountForSalesReturns: any =
        await ledgerAccountService.getSalesReturnsAndAllowancesLedgerAccount(
            clientId,
            transaction
        );

    if (!ledgerAccountForSalesReturns) {
        ledgerAccountForSalesReturns =
            await ledgerAccountService.createSalesReturnsAndAllowancesLedgerAccount(
                clientId,
                transaction
            );
    }

    // Primary credit account for partyLedgerAccountId on debit entries
    const primaryCreditLedgerId = arPortion > 0 ? ledgerAccount.id : ledgerAccountForRefundPayable.id;

    // Journal entries for services attached with return. 
    await journalEntryServices.createJournalEntriesForTradeServicesOfReturns(returnRecord, locationId, transaction);

    // #1
            // Journal Entry for Sales Returns & Allowances (Contra-Revenue, taxable amount without tax).
            if(returnTaxable > 0) {
        await journalEntryRepository.create(
            {
                amount: returnTaxable,
                ledgerId: ledgerAccountForSalesReturns.id,
                type: JOURNAL_ENTRY_TYPE.DR,

                // reference
                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                referenceId: returnRecord.id,

                entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                entryForId: returnRecord.id,

        processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
            locationId: soLocationId,
                partyLedgerAccountId: primaryCreditLedgerId,
                },
    transaction
            );
        }

// Get ledger account for State tax.
const ledgerAccountForStateTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.STATE_TAX,
    clientId,
        }, transaction);

// Get ledger account for County tax.
const ledgerAccountForCountyTax: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.COUNTY_TAX,
    clientId,
        }, transaction);

const customerTax = salesOrder?.tax;
const stateTaxAmount = customerTax?.stateTax ? getPercentageValue(returnTaxable, customerTax.stateTax) : 0;

// #2
// Journal Entry for state tax.
        if(stateTaxAmount > 0) {
    await journalEntryRepository.create(
        {
            amount: stateTaxAmount,
            ledgerId: ledgerAccountForStateTax.id,
            type: JOURNAL_ENTRY_TYPE.DR,

            // reference
            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
            referenceId: returnRecord.id,

            entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
            entryForId: returnRecord.id,

    processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
        locationId: soLocationId,
            partyLedgerAccountId: primaryCreditLedgerId,
                },
transaction
            );
        }

// Calculate county tax.
const countyTax = customerTax?.value ? customerTax.value - (customerTax.stateTax || 0) : 0;
const countyTaxAmount = countyTax > 0 ? getPercentageValue(returnTaxable, countyTax) : 0;

// #3
// Journal Entry for county tax.
if (countyTaxAmount > 0) {
    await journalEntryRepository.create(
        {
            amount: countyTaxAmount,
            ledgerId: ledgerAccountForCountyTax.id,
            type: JOURNAL_ENTRY_TYPE.DR,

            // reference
            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
            referenceId: returnRecord.id,

            entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
            entryForId: returnRecord.id,

            processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
            locationId: soLocationId,
            partyLedgerAccountId: primaryCreditLedgerId,
        },
        transaction
    );
}

// Ensure total tax debits equal return tax if tax was non-zero but neither state nor county rate was split
const totalTaxAmount = Number(returnAmounts.final.tax || 0);
const calculatedTax = Number(decimal.decimalAdd(stateTaxAmount, countyTaxAmount));
const unallocatedTax = Number(decimal.decimalSubtract(totalTaxAmount, calculatedTax));
if (unallocatedTax > 0) {
    await journalEntryRepository.create(
        {
            amount: unallocatedTax,
            ledgerId: ledgerAccountForStateTax.id,
            type: JOURNAL_ENTRY_TYPE.DR,

            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
            referenceId: returnRecord.id,

            entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
            entryForId: returnRecord.id,

            processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
            locationId: soLocationId,
            partyLedgerAccountId: primaryCreditLedgerId,
        },
        transaction
    );
}

// #4
        // Scenario 2D: Credit Customer Accounts Receivable (AR) for unpaid portion
        if(arPortion > 0) {
    await journalEntryRepository.create(
        {
            amount: arPortion,
            ledgerId: ledgerAccount.id,
            type: JOURNAL_ENTRY_TYPE.CR,

            // reference
            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
            referenceId: returnRecord.id,

            entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
            entryForId: returnRecord.id,

    processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
        locationId: soLocationId,
            partyLedgerAccountId: ledgerAccountForSalesReturns.id,
                },
transaction
            );
        }

// #5
// Scenario 2E: Credit Customer Refund Payable for paid portion (liability until cash/bank refunded)
if (refundPortion > 0) {
    await journalEntryRepository.create(
        {
            amount: refundPortion,
            ledgerId: ledgerAccountForRefundPayable.id,
            type: JOURNAL_ENTRY_TYPE.CR,

            // reference
            referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
            referenceId: returnRecord.id,

            entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
            entryForId: returnRecord.id,

            processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,
            locationId: soLocationId,
            partyLedgerAccountId: ledgerAccountForSalesReturns.id,
        },
        transaction
    );

    // Auto-create Credit Note for the customer for the paid portion
    const invoiceCode = returnRecord.soInvoice?.invoiceCode || returnRecord.soInvoice?.id;
    const returnCode = returnRecord.code || returnRecord.id;
    await creditDebitNoteRepository.createCreditDebitNote(
        {
            amount: refundPortion,
            type: CREDIT_DEBIT_NOTE_TYPES.CREDIT,
            entryFor: CREDIT_DEBIT_NOTE_ENTRY_FOR_TYPES.CUSTOMER,
            entryIdFor: customerId,
            referenceType: CREDIT_NOTE_REFERENCE_TYPES.RETURN,
            referenceId: returnRecord.id,
            creditNoteDate: new Date().toISOString().split("T")[0],
            reasonType: "sales_return",
            remarks: `Credit Note for Return #${returnCode} on Invoice #${invoiceCode}`,
            clientId,
            status: "active",
        },
        transaction
    );
}

// Get ledger account for finished goods.
const ledgerAccountForFinishedGoods: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
    clientId,
        }, transaction);

// Get ledger account for finished cogs.
const ledgerAccountForCogs: any = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
    clientId,
        }, transaction);

// Update status of all products to IN_INVENTORY and post inventory restocking entries
for (const returnProduct of returnRecord.returnProducts) {
    // Check if it's a slab or generic product
    const isSlabType = returnProduct.salesOrderProduct.inventoryProduct.isSlabType;

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

        // Restock inventory (DR Finished Goods / Merchandise Inventory)
        await journalEntryRepository.create(
            {
                amount: inventoryProduct.assetValue,
                ledgerId: ledgerAccountForFinishedGoods.id,
                type: JOURNAL_ENTRY_TYPE.DR,

                subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
                subReferenceId: slabData.id,

                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                referenceId: returnRecord.id,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,

                entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                entryForId: returnRecord.id,

                locationId: soLocationId,
                partyLedgerAccountId: ledgerAccountForCogs.id,
            },
            transaction
        );

        // Reverse Cost of Goods Sold (CR COGS)
        await journalEntryRepository.create(
            {
                amount: inventoryProduct.assetValue,
                ledgerId: ledgerAccountForCogs.id,
                type: JOURNAL_ENTRY_TYPE.CR,

                subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB,
                subReferenceId: slabData.id,

                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.RETURN,
                referenceId: returnRecord.id,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.CONFIRM_RETURN,

                entryFor: JOURNAL_ENTRY_FOR_TYPES.RETURN,
                entryForId: returnRecord.id,

                locationId: soLocationId,
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

await activityService.logActivity({
    clientId,
    activityType: ACTIVITY_TYPE.RETURN_CONFIRMATION,
    referenceId: returnId,
    referenceType: ACTIVITY_REFERENCE_TYPE.RETURN,
    title: "Return Confirmed",
    description: `Return #${returnId} has been confirmed.`,
    locationId
}, transaction);

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

        await activityService.logActivity({
            clientId: requestContext.getStore()?.clientId || returnRecord.clientId || 0,
            activityType: ACTIVITY_TYPE.RETURN_REJECTION,
            referenceId: returnId,
            referenceType: ACTIVITY_REFERENCE_TYPE.RETURN,
            title: "Return Cancelled",
            description: `Return #${returnId} has been cancelled/rejected.`,
        }, transaction);

        await transaction.commit();
        return returnRecord;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

export const getAllReturnsPaginated = async (page: number, limit: number, clientId: number, filter: any, search?: string) => {
    return await returnRepository.getAllReturnsPaginated(page, limit, clientId, filter, search);
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

    // Get all sales order product IDs from the invoice's packaging list or loading order
    const validSalesOrderProducts =
        invoiceData.packagingList?.salesOrderProducts ||
        invoiceData.loadingOrder?.salesOrderProducts ||
        [];
    const validSalesOrderProductIds = validSalesOrderProducts.map(
        (sop: any) => sop.id
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
