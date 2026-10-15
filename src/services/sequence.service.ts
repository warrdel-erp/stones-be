import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import * as sequenceRepo from "../repositories/modelSequence.repository";
import { GLOBAL_SCOPE_KEY } from "../constants/sequenceTypes";
import { AppError } from "../helper/appError";

export interface GetNextSequenceParams {
  clientId: number;
  modelName: string;
  scopeKey?: string;
  transaction?: Transaction;
}

export interface GetPreviewSequenceParams {
  clientId: number;
  modelName: string;
  scopeKey?: string;
  transaction?: Transaction;
}

const allocateSequenceWithinTransaction = async (
  clientId: number,
  modelName: string,
  scopeKey: string,
  transaction: Transaction
): Promise<number> => {
  // Ensure the sequence record exists (defaults to lastNumber: 0, so next starts from 1)
  await sequenceRepo.ensureSequenceRecord(clientId, modelName, scopeKey, 0, transaction);

  // Lock the record FOR UPDATE
  const sequenceRecord = await sequenceRepo.findSequenceForUpdate(clientId, modelName, scopeKey, transaction);

  if (!sequenceRecord) {
    throw new AppError(`Failed to lock sequence record for ${modelName}`, 500);
  }

  const currentNumber = Number(sequenceRecord.lastNumber) || 0;
  const nextNumber = currentNumber + 1;

  await sequenceRepo.updateSequenceLastNumber(sequenceRecord.id!, nextNumber, transaction);

  return nextNumber;
};

/**
 * Generate the next sequential number for a given model and client with pessimistic row-level locking.
 * If a transaction is supplied, the lock and update occur inside that transaction.
 * If no transaction is provided, an isolated transaction is spawned automatically.
 */
export const getNextSequenceNumber = async (
  params: GetNextSequenceParams
): Promise<number> => {
  const { clientId, modelName, scopeKey = GLOBAL_SCOPE_KEY, transaction } = params;

  if (!clientId) {
    throw new AppError("clientId is required to generate sequence number", 400);
  }
  if (!modelName) {
    throw new AppError("modelName is required to generate sequence number", 400);
  }

  if (transaction) {
    return await allocateSequenceWithinTransaction(clientId, modelName, scopeKey, transaction);
  } else {
    return await sequelize.transaction(async (t) => {
      return await allocateSequenceWithinTransaction(clientId, modelName, scopeKey, t);
    });
  }
};

/**
 * Get the preview of the next sequence number without locking or incrementing the counter.
 */
export const getPreviewSequenceNumber = async (
  params: GetPreviewSequenceParams
): Promise<number> => {
  const { clientId, modelName, scopeKey = GLOBAL_SCOPE_KEY, transaction } = params;

  if (!clientId || !modelName) {
    return 1;
  }

  const record = await sequenceRepo.findSequenceForPreview(clientId, modelName, scopeKey, transaction);
  if (record) {
    return Number(record.lastNumber) + 1;
  }

  return 1;
};
