import { AppError } from "../helper/appError";
import * as termsConditionRepository from "../repositories/termsCondition.repository";

export const createTermsCondition = async (data: any) => {
  const { clientId } = data;

  if (!clientId) {
    throw new AppError("Client ID is required.", 400);
  }

  // Check if terms condition already exists for this client
  const existingTermsCondition = await termsConditionRepository.getTermsConditionByFilter({ clientId });

  if (existingTermsCondition) {
    throw new AppError("Terms and conditions already exist for this client. Use update endpoint instead.", 400);
  }

  return await termsConditionRepository.createTermsCondition(data);
};

export const getTermsConditionByClientId = async (clientId: number) => {
  if (!clientId) {
    throw new AppError("Client ID is required.", 400);
  }

  const termsCondition = await termsConditionRepository.getTermsConditionByFilter({ clientId });

  return termsCondition;
};

export const updateTermsCondition = async (id: number, data: any) => {
  if (!id) {
    throw new AppError("Terms condition ID is required.", 400);
  }

  // Check if terms condition exists
  const existingTermsCondition = await termsConditionRepository.getTermsConditionById(id);

  if (!existingTermsCondition) {
    throw new AppError("Terms condition not found.", 404);
  }

  // If clientId is being updated, check if another record exists for that client
  if (data.clientId && data.clientId !== existingTermsCondition.get("clientId")) {
    const existingForClient = await termsConditionRepository.getTermsConditionByFilter({ clientId: data.clientId });

    if (existingForClient && existingForClient.get("id") !== id) {
      throw new AppError("Terms and conditions already exist for this client.", 400);
    }
  }

  const [affectedRows] = await termsConditionRepository.updateTermsCondition(id, data);

  if (affectedRows === 0) {
    throw new AppError("Failed to update terms condition.", 500);
  }

  // Return updated record
  return await termsConditionRepository.getTermsConditionById(id);
};


