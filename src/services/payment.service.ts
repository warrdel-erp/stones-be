import * as paymentRepository from "../repositories/payment.repository";

// Create a new payment
export const createPayment = async (data: any) => {
  return await paymentRepository.createPayment(data);
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
