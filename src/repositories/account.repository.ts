import { Transaction } from "sequelize";
import * as models from "../models";
import { Account } from "../models";
import { Model } from "sequelize";
import { User } from "../models";
import { Client } from "../models";
import { scoped } from "../utils/scoped";

// Create a new account
export const createAccount = async (accountData: {
    email: string;
    password: string;
}, transaction?: Transaction) => {
    return await scoped(Account).create(accountData, { transaction });
};

// Get account by email
export const getAccountByEmail = async (email: string) => {
    return await scoped(Account).findOne({
        where: { email },
        include: [
            { model: User, as: 'user' },
            { model: Client, as: 'client' }
        ]
    });
};

// Get account by ID
export const getAccountById = async (id: number) => {
    return await Account.findByPk(id, {
        include: [
            { model: User, as: 'user' },
            { model: Client, as: 'client' }
        ]
    });
};

// Update account
export const updateAccount = async (id: number, accountData: Partial<any>, transaction?: Transaction) => {
    const account = await Account.findByPk(id);
    if (!account) return null;
    return await account.update(accountData, { transaction });
};

// Delete account
export const deleteAccount = async (id: number, transaction?: Transaction) => {
    const account = await Account.findByPk(id);
    if (!account) return false;
    await account.destroy({ transaction });
    return true;
}; 