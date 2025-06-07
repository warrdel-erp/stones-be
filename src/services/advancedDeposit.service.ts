import { sequelize } from "../config/database";
import AdvancedDeposit from "../models/advancedDeposit.model";
import SalesOrder from "../models/salesOrder.model";
import Payment from "../models/payment.model";
import PaymentBill from "../models/paymentBills.model";
import { PAYMENT_BILL_REFERENCE_TYPES, PAYMENT_TYPE, PAYEE_TYPE } from "../constants/tableTypes";

interface CreateAdvancedDepositDTO {
    amount: number;
    salesOrderId: number;
    paymentMethod: string;
}

/**
 * Creates a new advanced deposit with associated payment and payment bill records
 */
export const createAdvancedDeposit = async (data: CreateAdvancedDepositDTO) => {
    const transaction = await sequelize.transaction();

    try {
        // Validate sales order exists and get client info
        const salesOrder: any = await SalesOrder.findByPk(data.salesOrderId, {
            transaction,
            attributes: ['id', 'clientId'],
            include: ['customer']
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
                status: "completed",
                clientId: salesOrder.clientId,
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

        await transaction.commit();

        return advancedDeposit;
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