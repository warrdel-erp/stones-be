
import * as freightBillRepository from '../repository/freightRepository.js'
import sequelize from '../database/sequelizeConfig.js';

export async function addFreightBill(info) {
    console.log(info, 'shshs');

    const transaction = await sequelize.transaction();
    try {
        const freightCreate = await freightBillRepository.addFreightBill(info.freightBillData, transaction);
        const freightBillsId = freightCreate.dataValues.freightBillsId;
        const createdFreightBillDetails = [];
        for (const detail of info.freightBillDetails) {
            const freightDetail = {
                ...detail,
                freightBillsId
            };
            const createdDetail = await freightBillRepository.addFreightBillDetails(freightDetail, transaction);
            createdFreightBillDetails.push(createdDetail);
        }
        await transaction.commit();
        console.log('Freight bill and details created successfully.');
        return {
            freightBill: freightCreate,
            freightBillDetails: createdFreightBillDetails
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating freight bill:', error);
        throw error;
    }
}


//get freigh data 
export async function getFreightData(data) {
    try {
        const freightBill = await freightBillRepository.getFreightData(data);
        console.log(freightBill, 'jsjsjs');

        return freightBill;
    } catch (error) {
        console.error('Error fetching freight details:', error);
        throw error;
    }
}


export async function getFreightAccounts(data) {
    try {
        const freightBill = await freightBillRepository.getFreightAccounts(data);
        console.log(freightBill, 'jsjsjs');


        const accountDetails = freightBill.map(subAccount => {
            const accountSubtypes = subAccount.dataValues.accountSubtype || [];
            return accountSubtypes.map(account => ({
                accountName: account.accountName,
                accountsId: account.accountsId,
            }));
        }).flat();

        console.log(accountDetails);

        return accountDetails;
    } catch (error) {
        console.error('Error fetching freight details:', error);
        throw error;
    }
}
