import * as models from "../models";

// Create ledger account.
export const createTransaction = async (data: any) => {
  return await models.Transaction.create(data);
};
