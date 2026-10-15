import { Transaction } from "sequelize";
import ModelSequence, { ModelSequenceInstance } from "../models/modelSequence.model";
import { scoped } from "../utils/scoped";
import { requestContext } from "../utils/requestContext";

const getQueryModel = () => {
  const store = requestContext.getStore();
  return store?.clientId ? scoped(ModelSequence) : ModelSequence;
};

/**
 * Ensure a sequence record exists in model_sequences table using Sequelize findOrCreate.
 */
export const ensureSequenceRecord = async (
  clientId: number,
  modelName: string,
  scopeKey: string,
  initialNumber: number = 0,
  transaction?: Transaction
): Promise<void> => {
  await ModelSequence.findOrCreate({
    where: { clientId, modelName, scopeKey },
    defaults: {
      clientId,
      modelName,
      scopeKey,
      lastNumber: initialNumber,
    },
    transaction,
  });
};

/**
 * Fetch sequence record with an exclusive row-level lock (FOR UPDATE) within the provided transaction.
 */
export const findSequenceForUpdate = async (
  clientId: number,
  modelName: string,
  scopeKey: string,
  transaction: Transaction
): Promise<ModelSequenceInstance | null> => {
  const model: any = getQueryModel();
  return await model.findOne({
    where: { clientId, modelName, scopeKey },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
};

/**
 * Fetch sequence record without lock for preview purposes.
 */
export const findSequenceForPreview = async (
  clientId: number,
  modelName: string,
  scopeKey: string,
  transaction?: Transaction
): Promise<ModelSequenceInstance | null> => {
  const model: any = getQueryModel();
  return await model.findOne({
    where: { clientId, modelName, scopeKey },
    transaction,
  });
};

/**
 * Update the lastNumber of a sequence record within the active transaction.
 */
export const updateSequenceLastNumber = async (
  sequenceId: number,
  lastNumber: number,
  transaction: Transaction
): Promise<void> => {
  await ModelSequence.update(
    { lastNumber },
    {
      where: { id: sequenceId },
      transaction,
    }
  );
};
