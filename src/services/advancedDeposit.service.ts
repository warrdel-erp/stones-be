import { sequelize } from "../config/database";
import AdvancedDeposit from "../models/advancedDeposit.model";
import SalesOrder from "../models/salesOrder.model";
import Payment from "../models/payment.model";
import PaymentBill from "../models/paymentBills.model";
import * as journalEntryRepository from '../repositories/journalEntry.repository'
import { PAYMENT_BILL_REFERENCE_TYPES, PAYMENT_TYPE, PAYEE_TYPE, JOURNAL_ENTRY_TYPE, JOURNAL_ENTRY_PROCESS_TYPE, JOURNAL_ENTRY_REFERENCE_TYPES, JOURNAL_ENTRY_FOR_TYPES, LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import * as advancedDepositRepository from '../repositories/advancedDeposit.repository'
import * as paymentBillsRepository from '../repositories/paymentBills.repository'
import * as models from '../models'
import { AppError } from "../helper/appError";
import { sumDecimal } from "../helper";
import Decimal from "decimal.js";
interface CreateAdvancedDepositDTO {
    amount: number;
    salesOrderId: number;
    paymentMethod: string;
    referenceNo?: string;
    accountId: number
}

/**
 * Creates a new advanced deposit with associated payment and payment bill records
 */
export const createAdvancedDeposit = async (data: CreateAdvancedDepositDTO, locationId: number) => {
    const transaction = await sequelize.transaction();

    try {
        // Validate sales order exists and get client info
        const salesOrder: any = await SalesOrder.findByPk(data.salesOrderId, {
            transaction,
            attributes: ['id', 'clientId'],
            include: [
                {
                    association: 'customer',
                    include: [
                        {
                            association: 'ledgerAccount',
                        }
                    ]
                }
            ]
        });

        if (!salesOrder) {
            throw new Error("Sales order not found");
        }

        if (!salesOrder.clientId) {
            throw new Error("Sales order must be associated with a client");
        }

        // Create advanced deposit
        const advancedDeposit: any = await AdvancedDeposit.create(
            {
                amount: data.amount,
                salesOrderId: data.salesOrderId,
                accountId: data.accountId
            },
            { transaction }
        );

        // Create payment record
        const payment: any = await Payment.create(
            {
                paymentType: PAYMENT_TYPE.INCOMING,
                payeeId: salesOrder.customer.id,
                payeeType: PAYEE_TYPE.CUSTOMER,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                referenceNo: advancedDeposit.id,
                status: "completed",
                clientId: salesOrder.clientId,
                paymentFor: 'ADVANCED_DEPOSIT',
                paymentForId: advancedDeposit.id
            },
            { transaction }
        );

        // Create payment bill record
        await PaymentBill.create(
            {
                paymentId: payment.id,
                referenceId: advancedDeposit.id,
                referenceType: PAYMENT_BILL_REFERENCE_TYPES.ADVANCED_DEPOSIT,
                amount: data.amount,
                description: `Advanced deposit for Sales Order #${data.salesOrderId}`,
            },
            { transaction }
        );

        const customerJournalEntry = await journalEntryRepository.create(
            {
                amount: data.amount,
                ledgerId: data.accountId,
                type: JOURNAL_ENTRY_TYPE.CR,
                // reference is the BILL.
                referenceId: advancedDeposit.id,
                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.ADVANCE_DEPOSIT,

                locationId,
                partyLedgerAccountId: salesOrder.customer.ledgerAccount.id,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.ADVANCE_DEPOSIT,
            },
            transaction
        );

        const accountJournalEntry = await journalEntryRepository.create(
            {
                amount: data.amount,
                ledgerId: salesOrder.customer.ledgerAccount.id,
                type: JOURNAL_ENTRY_TYPE.DR,

                referenceId: advancedDeposit.id,
                referenceType: JOURNAL_ENTRY_REFERENCE_TYPES.ADVANCE_DEPOSIT,

                locationId,
                partyLedgerAccountId: data.accountId,

                processType: JOURNAL_ENTRY_PROCESS_TYPE.ADVANCE_DEPOSIT,
            },
            transaction
        );

        await transaction.commit();

        return { advancedDeposit, customerJournalEntry, accountJournalEntry };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/**
 * Get advanced deposit by ID with its associations
 */
export const getAdvancedDepositById = async (id: number) => {
    return await AdvancedDeposit.findByPk(id, {
        include: [
            {
                association: 'salesOrder',
                attributes: ['id', 'clientSoNumber', 'clientId']
            },
            {
                association: 'settlements',
                include: [
                    {
                        association: 'soInvoice',
                        attributes: ['id', 'invoiceCode', 'amount']
                    }
                ]
            }
        ]
    });
};

/**
 * Get all advanced deposits for a sales order
 */
export const getAdvancedDepositsBySalesOrderId = async (salesOrderId: number) => {
    return await AdvancedDeposit.findAll({
        where: { salesOrderId },
        include: [
            {
                model: SalesOrder,
                attributes: ['id', 'orderNumber', 'clientId']
            }
        ]
    });
};


export const getAdvancedDepositWithoutPagination = (filters: Record<string, string>) => {
    return advancedDepositRepository.getAdvancedDepositWithoutPagination(filters);
}

/**
 * Settle an advanced deposit against multiple invoices
 * @param advancedDepositId - Advanced Deposit ID
 * @param settlements - Array of { invoiceId, amount }
 */
export const settleAdvancedDeposit = async (
    advancedDepositId: number,
    settlements: Array<{ invoiceId: number; amount: number }>
) => {
    const transaction = await sequelize.transaction();

    try {
        // Get the advanced deposit
        const advancedDeposit: any = await AdvancedDeposit.findByPk(advancedDepositId, { transaction });

        if (!advancedDeposit) {
            throw new AppError("Advanced deposit not found", 400);
        }

        const advancedDepositAmount = new Decimal(advancedDeposit.amount);

        // Get all existing settlements for this advanced deposit
        const existingSettlements = await models.AdvancedDepositSettlement.findAll({
            where: { advancedDepositId },
            transaction,
        });

        // Calculate total settled amount for this advanced deposit
        const totalSettledAmount = sumDecimal(existingSettlements, "amount");
        const totalSettledAmountDecimal = new Decimal(totalSettledAmount);

        // Calculate total new settlement amount
        const totalNewSettlementAmount = sumDecimal(settlements, "amount");
        const totalNewSettlementAmountDecimal = new Decimal(totalNewSettlementAmount);

        // Validate that total settled + new amounts don't exceed advanced deposit amount
        const totalSettledWithNew = totalSettledAmountDecimal.plus(totalNewSettlementAmountDecimal);

        if (totalSettledWithNew.gt(advancedDepositAmount)) {
            const available = advancedDepositAmount.minus(totalSettledAmountDecimal);
            throw new AppError(
                `Total settlement amount exceeds available advanced deposit. Available: ${available.toNumber()}, Requested: ${totalNewSettlementAmountDecimal.toNumber()}`
                , 400
            );
        }

        // Validate each invoice and check total amounts
        const createdSettlements = [];
        const invoiceTotals = new Map<number, Decimal>();

        for (const settlement of settlements) {
            const invoiceId = Number(settlement.invoiceId);
            const settlementAmount = new Decimal(settlement.amount);

            // Get the invoice
            const soInvoice: any = await models.SalesOrderInvoice.findByPk(invoiceId, { transaction });

            if (!soInvoice) {
                throw new AppError(`Invoice with ID ${invoiceId} does not exist.`, 400);
            }

            const invoiceAmount = new Decimal(soInvoice.finalAmount);

            // Get total paid amount from PaymentBills (this already includes existing AdvancedDepositSettlements)
            const totalPaidAmount = await paymentBillsRepository.getTotalPaidAmountOfBill(
                invoiceId,
                PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE
            );

            // Track total settlements for this invoice (including new ones in this batch)
            const existingTotalForInvoice = invoiceTotals.get(invoiceId) || new Decimal(0);
            const newTotalForInvoice = existingTotalForInvoice.plus(settlementAmount);
            invoiceTotals.set(invoiceId, newTotalForInvoice);

            // Validate that total payments + all settlements (existing + new in batch) <= invoice amount
            const totalPaidAmountDecimal = new Decimal(totalPaidAmount);
            const totalAmount = totalPaidAmountDecimal.plus(newTotalForInvoice);

            if (totalAmount.gt(invoiceAmount)) {
                const available = invoiceAmount.minus(totalPaidAmountDecimal);
                throw new AppError(
                    `Cannot settle invoice ${invoiceId}. The total settlement amount (${newTotalForInvoice.toNumber()}) exceeds the invoice total (${available.toNumber()}). Invoice total: ${invoiceAmount.toNumber()}, Already paid: ${totalPaidAmountDecimal.toNumber()}`
                    , 400);
            }

            // Create the settlement
            const createdSettlement = await models.AdvancedDepositSettlement.create(
                {
                    amount: settlementAmount.toNumber(),
                    soInvoiceId: invoiceId,
                    advancedDepositId: advancedDepositId,
                },
                { transaction }
            );
            createdSettlements.push(createdSettlement);
        }

        await transaction.commit();
        return createdSettlements;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};