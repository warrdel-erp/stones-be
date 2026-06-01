import { Transaction } from "sequelize";
import Activity from "../models/activity.model";
import Account from "../models/Account.model";
import User from "../models/user.model";
import { scoped } from "../utils/scoped";

export interface CreateActivityData {
  clientId: number;
  activityType: string;
  referenceId?: number;
  referenceType?: string;
  title: string;
  description?: string;
  accountId?: number;
  locationId?: number;
}

export const createActivity = async (data: CreateActivityData, transaction?: Transaction) => {
  return await scoped(Activity).create(data, { transaction });
};

export const getActivities = async (filters: any = {}, page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  return await scoped(Activity).findAndCountAll({
    where: filters,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    include: [
      {
        model: Account,
        as: "account",
        attributes: ["id", "email"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["username"],
          },
        ],
      },
    ],
  });
};
