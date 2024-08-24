import { Op } from 'sequelize';
import * as model from '../models/index.js';

export async function register(data) {
    try {
        const result = await model.clientUserModel.create(data);
        return result;
    } catch (error) {
        console.error("Error during client user registration:", error);
        throw error;
    }
}


//find client id based on users id address
export async function findClientID(userId) {
    try {
        const result = await model.clientUserModel.findOne({
            where: {
                userId: userId
            },
        });
        return result;
    } catch (error) {
        console.error("Error during client user registration:", error);
        throw error;
    }
}

//find userids based on client id 

export async function findUserId(clientId) {
    try {
        const result = await model.clientUserModel.findAll({
            where: {
                clientId: clientId
            },
        });
        return result;
    } catch (error) {
        console.error("Error during client user registration:", error);
        throw error;
    }
}