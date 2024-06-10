import * as accountsRepository from '../repository/accountsRepository.js';

export async function addAccount(info){
    return await accountsRepository.addAccount(info);
};
getAllAccountsTypeAndSubTypes
export async function getAllAccounts(search) {
    try {
        const salesOrders = await accountsRepository.getAllAccounts(search);
        return salesOrders;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
};

export async function getAllAccountsTypeAndSubTypes() {
    try {
        const salesOrders = await accountsRepository.getAllTypeSubTypes();
        return salesOrders;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}