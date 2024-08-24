import * as clientRepository from '../repository/clientRepository.js';
import * as clientUsersRepository from '../repository/clientUserRepository.js'
import bcrypt from "bcryptjs";


var salt = bcrypt.genSaltSync(10);

export async function register(info) {
    try {
        let { clientName, clientPassword, clientEmail, clientLocation } = info;
        const hashedPassword = await bcrypt.hash(clientPassword, salt);

        const data = {
            clientName: clientName,
            clientPassword: hashedPassword,
            clientEmail: clientEmail.toLowerCase(),
            clientLocation: clientLocation
        };

        return await clientRepository.register(data);

    } catch (error) {
        console.error("Error during client registration:", error);
        throw new Error(error || "Registration failed");
    }
}


//find client details based on clientId
export async function findUserId(data) {
    try {
        const accessOfData = await clientUsersRepository.findUserId(data);
        return accessOfData;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
};
