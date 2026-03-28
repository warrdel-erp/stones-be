import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createPayment = async (paymentData: any, transaction: Transaction) => {
  return await scoped(models.Payment).create(paymentData, { transaction });
};

export const getAllPayments = async (filters: any = {}, page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await scoped(models.Payment).findAndCountAll({
    where: filters,
    include: [
      {
        model: models.PaymentBill,
        as: "paymentBills",
        include: [
          {
            model: models.SIPL,
            as: "sipl",
          },
          {
            model: models.Bill,
            as: "bill",
          },
          {
            model: models.SalesOrderInvoice,
            as: "soInvoice",
          }
        ]
      },
      {
        model: models.CreditDebitNote,
        as: "creditDebitNote",
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return { total: count, payments: rows, page, limit };
};

export const getPaymentById = async (id: number) => {
  return await models.Payment.findByPk(id, {
    include: [
      {
        association: 'client',
        include: [
          {
            association: 'company'
          }
        ]
      },
      {
        association: 'paymentBills',
        include: [
          {
            association: 'sipl'
          },
          {
            association: 'bill'
          },
          {
            association: 'soInvoice'
          },
          {
            association: 'advancedDeposit'
          },
        ]
      },
      {
        association: 'creditDebitNote'
      }
    ]
  });
};

export const updatePaymentStatus = async (id: number, status: string) => {
  return await scoped(models.Payment).update({ status }, { where: { id } });
};

export const deletePayment = async (id: number) => {
  return await scoped(models.Payment).destroy({ where: { id } });
};

// Get latest Bill number
export const getTransactionNumber = async (clientId: number) => {
  let lastPayment: any = await scoped(models.Payment).findOne({
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

