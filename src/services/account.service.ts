import bcrypt from "bcryptjs";
import { AppError } from "../helper/appError";
import * as accountRepository from "../repositories/account.repository";
import jwt from "jsonwebtoken";
import { Model, Transaction } from "sequelize";

// Define the Account model instance type with its associations
interface AccountInstance extends Model<any, any> {
    getUser(): Promise<Model<any, any> | null>;
    getClient(): Promise<Model<any, any> | null>;
    getDataValue<K extends string | number | symbol>(key: K): any;
}

// Create a new account
export const createAccount = async (accountData: {
    email: string;
    password: string;
}, transaction: Transaction) => {

    // Check if account exists
    const existingAccount = await accountRepository.getAccountByEmail(accountData.email);
    if (existingAccount) {
        throw new AppError("Account with this email already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(accountData.password, 10);

    // Create account
    const account = await accountRepository.createAccount({
        email: accountData.email,
        password: hashedPassword
    }, transaction);

    return account;
};

// Authenticate account
export const authenticateAccount = async (email: string, password: string) => {
    const account = await accountRepository.getAccountByEmail(email) as AccountInstance | null;
    if (!account) return null;

    const isMatch = await bcrypt.compare(password, account.getDataValue('password'));
    if (!isMatch) return null;

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not set");
    }

    // Prepare user data based on account type
    let userData: any = {
        email: account.getDataValue('email')
    };

    // Get the associated user or client
    const user = await account.getUser();
    const client = await account.getClient();

    // Check which association exists to determine account type
    if (user) {
        const userModel = user as Model<any, any>;
        userData = {
            ...userData,
            id: userModel.getDataValue('id'),
            userid: userModel.getDataValue('userid'),
            clientId: userModel.getDataValue('clientId'),
            accountType: 'user'
        };
    } else if (client) {
        const clientModel = client as Model<any, any>;
        userData = {
            ...userData,
            id: clientModel.getDataValue('id'),
            clientId: clientModel.getDataValue('id'),
            accountType: 'client'
        };
    } else {
        throw new AppError("Account has no associated user or client", 400);
    }

    const token = jwt.sign(userData, process.env.JWT_SECRET);

    return {
        token,
        user: userData
    };
};

// Check if email exists in accounts
export const checkEmailAvailability = async (email: string) => {
    const account = await accountRepository.getAccountByEmail(email);
    return !!account;
}; 