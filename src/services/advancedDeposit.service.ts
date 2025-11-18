import { sequelize } from "../config/database";
import AdvancedDeposit from "../models/advancedDeposit.model";
import SalesOrder from "../models/salesOrder.model";
import Payment from "../models/payment.model";
import PaymentBill from "../models/paymentBills.model";
import * as journalEntryRepository from '../repositories/journalEntry.repository'
import { PAYMENT_BILL_REFERENCE_TYPES, PAYMENT_TYPE, PAYEE_TYPE, JOURNAL_ENTRY_TYPE, JOURNAL_ENTRY_PROCESS_TYPE, JOURNAL_ENTRY_REFERENCE_TYPES, JOURNAL_ENTRY_FOR_TYPES, LEDGER_ACCOUNT_REFERENCE_TYPES } from "../constants/tableTypes";
import * as advancedDepositRepository from '../repositories/advancedDeposit.repository'
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
                model: SalesOrder,
                attributes: ['id', 'orderNumber', 'clientId']
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