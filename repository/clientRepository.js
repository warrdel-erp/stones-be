import { Op } from 'sequelize';
import * as model from '../models/index.js';

export async function register(data) {
    try {
        const result = await model.clientModel.create(data);
        return result;
    } catch (error) {
        console.error("Error during client registration:", error);
        throw error;
    }
}

