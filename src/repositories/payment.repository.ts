import { Transaction } from "sequelize";
import * as models from "../models";
import { PAYEE_TYPE } from "../constants/tableTypes";

export const createPayment = async (paymentData: any, transaction: Transaction) => {
  return await models.Payment.create(paymentData, { transaction });
};

export const getAllPayments = async (filters: any = {}) => {
  return await models.Payment.findAll({
    where: filters,
    include: [
      {
        model: models.SIPL,
        as: "sipl",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const getPaymentById = async (id: number) => {
  return await models.Payment.findByPk(id);
};

export const updatePaymentStatus = async (id: number, status: string) => {
  return await models.Payment.update({ status }, { where: { id } });
};

export const deletePayment = async (id: number) => {
  return await models.Payment.destroy({ where: { id } });
};

// Get latest Bill number
export const getTransactionNumber = async (clientId: number) => {
  let lastPayment: any = await models.Payment.findOne({
    where: { clientId },
    order: [["clientTransactionNo", "DESC"]],
  });

  return { clientTransactionNo: lastPayment ? lastPayment?.clientTransactionNo + 1 : 1 };
};

export const getTotalAmountByPayeeTypeAndClientId = async (payeeType: string, clientId: number) => {
  if (!payeeType || !clientId) {
    throw new Error("Both payeeType and clientId are required");
  }

  const totalAmount = await models.Payment.sum('amount', {
    where: {
      payeeType,
      clientId,
    },
  });

  return totalAmount || 0; // Return 0 if no payments found
};

