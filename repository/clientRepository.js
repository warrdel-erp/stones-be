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


export async function getClientDetails(data) {
    try {
        const { clientId } = data;
        const result = await model.clientModel.findOne({
            where: {
                clientId: clientId
            }
        });
        return result;
    } catch (error) {
        console.error("Error fetching client details:", error);
        throw error;
    }
}



export async function getClientsUser(data) {
    try {
        const { clientId } = data;
        const result = await model.clientUserModel.findAll({
            where: {
                clientId: clientId
            }
        });
        return result.length;
    } catch (error) {
        console.error("Error fetching client users count:", error);
        throw error;
    }
}



export async function clientLocationCreate(data) {
    try {
        const result = await model.clientLocationModel.bulkCreate(data.clientLocations);
        return result;
    } catch (error) {
        console.error("Error adding client locations:", error);
        throw error;
    }
}





export async function getClientLocations(data) {
    try {
        // const { clientId } = data;
        const result = await model.clientModel.findOne({
            where: {
                clientId: data.clientId
            },
            // attributes: ['clientName'],
            include: [
                {
                    model: model.clientLocationModel,
                    as: 'clientDetails',
                    // attributes: ['clientId'],
                    include: [
                        {
                            model: model.locationModel,
                            as: 'locationDetails',
                            // attributes: ['locationId']

                        }
                    ]
                },

            ]
        });
        return result;
    } catch (error) {
        console.error("Error fetching client details:", error);
        throw error;
    }
}