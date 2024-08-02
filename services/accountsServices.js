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

export async function updateAccount(accountsId, info){
    return await accountsRepository.updateAccount(accountsId, info)
}

export async function deleteAccount(accountsId) {
    try {
        const accountDetails = await accountsRepository.findAccountNumber(accountsId);
        const canDelete = accountDetails.dataValues.canDelete;

        if (!canDelete) {
            await accountsRepository.deleteAccount(accountsId);
            return { message: 'Account deleted successfully' };
        } else {
            return { message: 'This account cannot be deleted because it is a permanent account' };
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        return { message: 'An error occurred while trying to delete the account', error: error.message };
    }
}



export async function getCashFinancialAssestOptions() {
    try {
        const subAccountDetails = await accountsRepository.getCashFinancialAssestOptions();
        return subAccountDetails;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}


export async function getGroupedAccountList() {
    try {
        const subAccountDetails = await accountsRepository.getGroupedAccountList();
        return subAccountDetails;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}


export async function getAccountIdByAccountName(data) {
    try {
        console.log(data,'jsdjsj');
        const accountDetails = await accountsRepository.getAccountIdByAccountName(data);
        return accountDetails;
    } catch (error) {
        console.error('Error fetching accounts Type Sub Types:', error);
        throw error;
    }
}
