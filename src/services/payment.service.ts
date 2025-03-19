import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import * as paymentRepository from "../repositories/payment.repository";
import * as paymentBillsRepository from "../repositories/paymentBills.repository";

// Create a new payment
export const processPayment = async (paymentData: any, billsData: any[]) => {
  if (!paymentData || !billsData || !Array.isArray(billsData) || billsData.length === 0) {
    throw new Error("Invalid request: Payment and bills data are required");
  }

  // Validate total amount
  const totalBillAmount = billsData.reduce((sum, bill) => sum + bill.amount, 0);

  if (totalBillAmount !== paymentData.amount) {
    throw new AppError("Total bill amount does not match payment amount", 400);
  }

  // Begin transaction
  const transaction = await sequelize.transaction();
  try {
    // Step 1: Create Payment
    const payment: any = await paymentRepository.createPayment(paymentData, transaction);

    // Step 2: Prepare Payment Bills
    const paymentBills = billsData.map((bill) => ({
      paymentId: payment.id,
      referenceId: bill.referenceId,
      amount: bill.amount,
    }));

    // Step 3: Insert Payment Bills
    const paymentBillsRes = await paymentBillsRepository.createPaymentBills(paymentBills, transaction);

    // Commit transaction
    await transaction.commit();
    return { payment, bills: paymentBillsRes };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get all payments
export const getPayments = async (filters: any) => {
  return await paymentRepository.getAllPayments(filters);
};

// Get payment by id
export const getPayment = async (id: number) => {
  return await paymentRepository.getPaymentById(id);
};

// de
export const deletePayment = async (id: number) => {
  return await paymentRepository.deletePayment(id);
};

// Get new bill number
export const getTransactionNumber = async (clientId: number) => {
  return await paymentRepository.getTransactionNumber(clientId);
};
