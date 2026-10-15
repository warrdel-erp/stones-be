import { Transaction } from "sequelize";
import { AppError } from "../helper/appError";
import DocumentNumberingConfig, {
  DOCUMENT_NUMBERING_TYPE,
  SEQUENCE_RESET_FREQUENCY,
  DocumentNumberingConfigInstance,
} from "../models/documentNumberingConfig.model";
import { getNextSequenceNumber, getPreviewSequenceNumber } from "./sequence.service";
import { GLOBAL_SCOPE_KEY } from "../constants/sequenceTypes";
import * as sequenceRepo from "../repositories/modelSequence.repository";
import { sequelize } from "../config/database";

export const DOCUMENT_TYPE_LABELS: Record<DOCUMENT_NUMBERING_TYPE, string> = {
  [DOCUMENT_NUMBERING_TYPE.QUOTATION]: "Quotation",
  [DOCUMENT_NUMBERING_TYPE.SALES_ORDER]: "Sales Order",
  [DOCUMENT_NUMBERING_TYPE.PACKAGING_LIST]: "Pick List",
  [DOCUMENT_NUMBERING_TYPE.LOADING_ORDER]: "Loading Order",
  [DOCUMENT_NUMBERING_TYPE.DELIVERY_NOTE]: "Delivery Note",
  [DOCUMENT_NUMBERING_TYPE.PURCHASE_ORDER]: "Purchase Order",
  [DOCUMENT_NUMBERING_TYPE.GOODS_RECEIPT]: "Goods Receipt",
  [DOCUMENT_NUMBERING_TYPE.INVOICE]: "Invoice",
  [DOCUMENT_NUMBERING_TYPE.CREDIT_NOTE]: "Credit Note",
  [DOCUMENT_NUMBERING_TYPE.PAYMENT_RECEIPT]: "Payment Receipt",
};

export const DEFAULT_CONFIGS: Record<
  DOCUMENT_NUMBERING_TYPE,
  { prefix: string; includeYear: boolean; separator: string; numberLength: number; sequenceReset: SEQUENCE_RESET_FREQUENCY }
> = {
  [DOCUMENT_NUMBERING_TYPE.QUOTATION]: { prefix: "QT", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.SALES_ORDER]: { prefix: "SO", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.PACKAGING_LIST]: { prefix: "PL", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.LOADING_ORDER]: { prefix: "LO", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.DELIVERY_NOTE]: { prefix: "DN", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.PURCHASE_ORDER]: { prefix: "PO", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.GOODS_RECEIPT]: { prefix: "GR", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.INVOICE]: { prefix: "INV", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.CREDIT_NOTE]: { prefix: "CN", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
  [DOCUMENT_NUMBERING_TYPE.PAYMENT_RECEIPT]: { prefix: "REC", includeYear: true, separator: "-", numberLength: 4, sequenceReset: SEQUENCE_RESET_FREQUENCY.YEARLY },
};

export interface UpdateDocumentNumberingInput {
  prefix?: string;
  includeYear?: boolean;
  separator?: string;
  numberLength?: number;
  sequenceReset?: SEQUENCE_RESET_FREQUENCY;
  nextNumber?: number;
}

export interface DocumentNumberingItemResponse {
  id: number;
  documentType: DOCUMENT_NUMBERING_TYPE;
  documentName: string;
  prefix: string;
  includeYear: boolean;
  separator: string;
  numberLength: number;
  sequenceReset: SEQUENCE_RESET_FREQUENCY;
  nextNumber: number;
  formattedNextNumber: string;
  numberFormat: string;
  preview: string;
}

const buildFormatString = (prefix: string, includeYear: boolean, separator: string, numberLength: number, year: number): string => {
  const parts: string[] = [prefix];
  if (includeYear) {
    parts.push(String(year));
  }
  parts.push("#".repeat(numberLength));
  return parts.join(separator);
};

const buildCodeString = (prefix: string, includeYear: boolean, separator: string, numberLength: number, num: number, year: number): string => {
  const parts: string[] = [prefix];
  if (includeYear) {
    parts.push(String(year));
  }
  parts.push(String(num).padStart(numberLength, "0"));
  return parts.join(separator);
};

/**
 * Ensures configuration exists for a given document type and returns it.
 */
export const getOrInitConfig = async (
  clientId: number,
  documentType: DOCUMENT_NUMBERING_TYPE,
  transaction?: Transaction
): Promise<DocumentNumberingConfigInstance> => {
  const defaults = DEFAULT_CONFIGS[documentType];
  const [config] = await DocumentNumberingConfig.findOrCreate({
    where: { clientId, documentType },
    defaults: {
      clientId,
      documentType,
      prefix: defaults.prefix,
      includeYear: defaults.includeYear,
      separator: defaults.separator,
      numberLength: defaults.numberLength,
      sequenceReset: defaults.sequenceReset,
    },
    transaction,
  });
  return config;
};

/**
 * Allocate sequential number and generated custom code within an active transaction.
 * Strict, locked, and fully immutable.
 */
export const allocateDocumentSequenceAndCode = async (params: {
  clientId: number;
  documentType: DOCUMENT_NUMBERING_TYPE;
  transaction?: Transaction;
}): Promise<{ sequenceNumber: number; code: string }> => {
  const { clientId, documentType, transaction } = params;
  const currentYear = new Date().getFullYear();

  const config = await getOrInitConfig(clientId, documentType, transaction);

  const scopeKey =
    config.sequenceReset === SEQUENCE_RESET_FREQUENCY.YEARLY
      ? String(currentYear)
      : GLOBAL_SCOPE_KEY;

  const sequenceNumber = await getNextSequenceNumber({
    clientId,
    modelName: documentType,
    scopeKey,
    transaction,
  });

  const code = buildCodeString(
    config.prefix,
    config.includeYear,
    config.separator,
    config.numberLength,
    sequenceNumber,
    currentYear
  );

  return { sequenceNumber, code };
};

/**
 * Preview document code for a given document type and next sequence number.
 */
export const previewDocumentCode = async (params: {
  clientId: number;
  documentType: DOCUMENT_NUMBERING_TYPE;
  nextNumber: number;
}): Promise<string> => {
  const config = await getOrInitConfig(params.clientId, params.documentType);
  const currentYear = new Date().getFullYear();
  return buildCodeString(
    config.prefix,
    config.includeYear,
    config.separator,
    config.numberLength,
    params.nextNumber,
    currentYear
  );
};

/**
 * Get all document numbering configurations for a client with previews.
 */
export const getDocumentNumberingConfigs = async (clientId: number): Promise<DocumentNumberingItemResponse[]> => {
  const currentYear = new Date().getFullYear();
  const documentTypes = Object.values(DOCUMENT_NUMBERING_TYPE);

  const results: DocumentNumberingItemResponse[] = [];

  for (const docType of documentTypes) {
    const config = await getOrInitConfig(clientId, docType);
    const scopeKey =
      config.sequenceReset === SEQUENCE_RESET_FREQUENCY.YEARLY
        ? String(currentYear)
        : GLOBAL_SCOPE_KEY;

    const nextNumber = await getPreviewSequenceNumber({
      clientId,
      modelName: docType,
      scopeKey,
    });

    const numberFormat = buildFormatString(
      config.prefix,
      config.includeYear,
      config.separator,
      config.numberLength,
      currentYear
    );

    const formattedNextNumber = String(nextNumber).padStart(config.numberLength, "0");

    const preview = buildCodeString(
      config.prefix,
      config.includeYear,
      config.separator,
      config.numberLength,
      nextNumber,
      currentYear
    );

    results.push({
      id: config.id,
      documentType: docType,
      documentName: DOCUMENT_TYPE_LABELS[docType],
      prefix: config.prefix,
      includeYear: config.includeYear,
      separator: config.separator,
      numberLength: config.numberLength,
      sequenceReset: config.sequenceReset as SEQUENCE_RESET_FREQUENCY,
      nextNumber,
      formattedNextNumber,
      numberFormat,
      preview,
    });
  }

  return results;
};

/**
 * Update document numbering configuration for a specific document type.
 */
export const updateDocumentNumberingConfig = async (
  clientId: number,
  documentType: DOCUMENT_NUMBERING_TYPE,
  data: UpdateDocumentNumberingInput
): Promise<DocumentNumberingItemResponse> => {
  return await sequelize.transaction(async (t) => {
    const config = await getOrInitConfig(clientId, documentType, t);
    const currentYear = new Date().getFullYear();

    if (data.prefix !== undefined) config.prefix = data.prefix.trim().toUpperCase();
    if (data.includeYear !== undefined) config.includeYear = data.includeYear;
    if (data.separator !== undefined) config.separator = data.separator;
    if (data.numberLength !== undefined) config.numberLength = data.numberLength;
    if (data.sequenceReset !== undefined) config.sequenceReset = data.sequenceReset;

    await config.save({ transaction: t });

    const targetScopeKey =
      config.sequenceReset === SEQUENCE_RESET_FREQUENCY.YEARLY
        ? String(currentYear)
        : GLOBAL_SCOPE_KEY;

    // If nextNumber is being moved forward
    if (data.nextNumber !== undefined) {
      if (data.nextNumber < 1) {
        throw new AppError("Next number must be at least 1.", 400);
      }

      await sequenceRepo.ensureSequenceRecord(clientId, documentType, targetScopeKey, 0, t);
      const lockedSequence = await sequenceRepo.findSequenceForUpdate(clientId, documentType, targetScopeKey, t);

      if (lockedSequence) {
        const currentLast = Number(lockedSequence.lastNumber) || 0;
        const currentNext = currentLast + 1;
        if (data.nextNumber < currentNext) {
          throw new AppError(
            `Next number can only be moved forward. It cannot be set lower than ${currentNext}. Existing numbers are never changed.`,
            400
          );
        }

        const newLast = data.nextNumber - 1;
        await sequenceRepo.updateSequenceLastNumber(lockedSequence.id!, newLast, t);
      }
    }

    const nextNumber = await getPreviewSequenceNumber({
      clientId,
      modelName: documentType,
      scopeKey: targetScopeKey,
      transaction: t,
    });

    const numberFormat = buildFormatString(
      config.prefix,
      config.includeYear,
      config.separator,
      config.numberLength,
      currentYear
    );

    const formattedNextNumber = String(nextNumber).padStart(config.numberLength, "0");

    const preview = buildCodeString(
      config.prefix,
      config.includeYear,
      config.separator,
      config.numberLength,
      nextNumber,
      currentYear
    );

    return {
      id: config.id,
      documentType,
      documentName: DOCUMENT_TYPE_LABELS[documentType],
      prefix: config.prefix,
      includeYear: config.includeYear,
      separator: config.separator,
      numberLength: config.numberLength,
      sequenceReset: config.sequenceReset as SEQUENCE_RESET_FREQUENCY,
      nextNumber,
      formattedNextNumber,
      numberFormat,
      preview,
    };
  });
};
