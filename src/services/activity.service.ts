import * as activityRepository from "../repositories/activity.repository";
import { requestContext } from "../utils/requestContext";
import { Transaction } from "sequelize";

export const logActivity = async (
  data: {
    clientId: number;
    activityType: string;
    referenceId?: number;
    referenceType?: string;
    title: string;
    description?: string;
    accountId?: number;
    locationId?: number;
  },
  transaction?: Transaction
) => {
  try {
    const store = requestContext.getStore();
    const finalAccountId = data.accountId || store?.accountId;
    const finalLocationId = data.locationId || store?.locationId;

    return await activityRepository.createActivity(
      {
        ...data,
        accountId: finalAccountId,
        locationId: finalLocationId,
      },
      transaction
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Do not throw error so we do not fail primary business transactions on log failures
  }
};

export const getActivitiesList = async (clientId: number, page: number = 1, limit: number = 20) => {
  return await activityRepository.getActivities({ clientId }, page, limit);
};
