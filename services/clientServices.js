import * as clientRepository from '../repository/clientRepository.js';
import * as clientUsersRepository from '../repository/clientUserRepository.js'
import bcrypt from "bcryptjs";


var salt = bcrypt.genSaltSync(10);

export async function register(info) {
    try {
        const {
            clientName,
            clientPassword,
            clientEmail,
            clientLocation,
            clientLocationShortName,
            clientType,
            clientAddress,
            clientCountry,
            clientCity,
            pincode,
            clientTax,
            clientPriceLevel,
            paymentTerms,
            clientLicenseNumber,
            userCount,
            clientId
        } = info;

        const hashedPassword = await bcrypt.hash(clientPassword, salt);
        const data = {
            clientName: clientName,
            clientPassword: hashedPassword,
            clientEmail: clientEmail.toLowerCase(),
            clientLocation: clientLocation,
            clientLocationShortName: clientLocationShortName,
            clientType: clientType,
            clientAddress: clientAddress,
            clientCountry: clientCountry,
            clientCity: clientCity,
            pincode: pincode,
            clientTax: clientTax,
            clientPriceLevel: clientPriceLevel,
            paymentTerms: paymentTerms,
            clientLicenseNumber: clientLicenseNumber,
            userCount: userCount
        };


        return await clientRepository.register(data);

    } catch (error) {
        console.error("Error during client registration:", error);
        throw new Error(error.message || "Registration failed");
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


export async function getClientDetails(data) {
    try {
        const clientsUserCount = await clientRepository.getClientsUser(data);

        const accessOfData = await clientRepository.getClientDetails(data);
        return {
            accessOfData,
            clientsUserCount,
        };
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
};


export async function clientLocationCreate(data) {
    try {
        const accessOfData = await clientRepository.clientLocationCreate(data);
        return accessOfData;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
};



export async function getClientLocations(data) {
    try {
        const accessOfData = await clientRepository.getClientLocations(data);
        return accessOfData;
    } catch (error) {
        console.error('Error fetching:', error);
        throw error;
    }
};