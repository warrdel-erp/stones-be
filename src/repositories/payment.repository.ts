import * as models from "../models";

export const createPayment = async (paymentData: any) => {
  return await models.Payment.create(paymentData);
};

export const getAllPayments = async (filters: any = {}) => {
  return await models.Payment.findAll({
    where: filters,
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
