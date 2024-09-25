
import * as opportunitiyRepository from '../repository/opportunityRepository.js'
import sequelize from '../database/sequelizeConfig.js';
import { updateSlabDetails } from '../repository/purchaseOrderRepository.js';
import { getSoNumber } from './salesOrderServices.js';
import { addProduct, createOrder } from '../repository/salesOrderRepository.js';
import { createSalesOrderWithProducts } from '../helpers/opportunityToSales.js';


//create opportunity
export async function addOpportunity(info) {
    console.log(info, 'ifnor');

    return await opportunitiyRepository.addOpportunity(info);
};


//get opportunity number
export async function getOpportunityNumber(clientId) {
    try {
        const opportunityDetails = await opportunitiyRepository.getOpportunityNumber(clientId);
        const today = new Date().toISOString().split('T')[0];
        return {
            opportunityNumber: opportunityDetails + 1,
            date: today
        };
    } catch (error) {
        console.error('Error fetching opportunity number:', error);
        throw error;
    }
};


// get all account type and account sub type
export async function getAllOpportunity(search) {
    try {
        const opportunityDetails = await opportunitiyRepository.getAllOpportunity(search);
        return opportunityDetails;
    } catch (error) {
        console.error('Error fetching opportunity details:', error);
        throw error;
    }
};

//create selection sheet for opportunity
export async function createSelectionSheet(info) {

    const transaction = await sequelize.transaction();
    try {
        const { opportunityId, products } = info[0];

        if (!opportunityId) {
            throw new Error('opportunityId is required');
        }

        if (!products || products.length === 0) {
            throw new Error('Products data is required');
        }

        let selectionSheetId;
        let incrementedPart;
        const lastSelectionSheetId = await opportunitiyRepository.lasteSelectionSheetNumber({ opportunityId });
        if (lastSelectionSheetId && lastSelectionSheetId.dataValues.selectionSheetId) {
            const lastId = lastSelectionSheetId.dataValues.selectionSheetId;
            const numericPart = parseInt(lastId.split('-').pop(), 10);
            incrementedPart = numericPart + 1;
        } else {
            incrementedPart = 1;
        }

        selectionSheetId = `${opportunityId}-${incrementedPart}`;

        const createdRecords = [];
        for (const product of products) {
            if (!product.productInventoryId || !product.poSlabDetailId) {
                throw new Error('Missing required fields in product');
            }
            const newRecord = await opportunitiyRepository.createSelectionSheet({
                opportunityId,
                selectionSheetId,
                productInventoryId: product.productInventoryId,
                poSlabDetailId: product.poSlabDetailId,
                status: product.status,
                createdBy: info.createdBy
            }, { transaction });

            createdRecords.push(newRecord);
            await updateSlabDetails({
                poSlabDetailId: product.poSlabDetailId,
                addedToSelectionSheet: true
            });
        }
        await transaction.commit();
        return createdRecords;
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }

        console.error('Error creating selection sheet:', error);
        throw error;
    }
}





//get single opportunity details page
export async function getOpportunityDetails(data) {

    try {
        const opportunityDetails = await opportunitiyRepository.getOpportunityDetails(data);
        if (opportunityDetails.oppSelectionSheet && opportunityDetails.oppSelectionSheet.length > 0) {
            const separatedSelectionSheets = {};
            opportunityDetails.oppSelectionSheet.forEach((selection) => {
                const selectionSheetId = selection.selectionSheetId;
                if (!separatedSelectionSheets[selectionSheetId]) {
                    separatedSelectionSheets[selectionSheetId] = [];
                }
                separatedSelectionSheets[selectionSheetId].push(selection);
            });
            opportunityDetails.oppSelectionSheet = separatedSelectionSheets;
        }
        return opportunityDetails;
    } catch (error) {
        console.error('Error fetching opportunity details:', error);
        throw error;
    }
}



//get product inventory
export async function getProductInventory(page, limit, clientId) {
    let result = [];
    const data = await opportunitiyRepository.getInventoryList(page, limit, clientId);
    for (const abc of data) {
        const abcd = abc.toJSON();

        // Extract and filter slabDetails only include where addedToSelectionSheet is 0
        const slabData = [].concat(...abcd?.productInventoryInvoiceMapper?.map(pim => {
            return (pim?.productInventoryInvoice?.slabDetails || []).filter(slab => slab.addedToSelectionSheet === 0);
        }));

        // Extract product details from supplierPurchaseProduct
        const productDetails = abcd?.productInventoryInvoiceMapper?.[0]?.productInventoryInvoice?.supplierPurchaseProduct?.products;

        const firstMapper = abcd?.productInventoryInvoiceMapper?.[0];
        const productInventoryInvoice = firstMapper?.productInventoryInvoice;


        if (productInventoryInvoice) {
            const { slabDetails, supplierPurchaseProduct, ...restProductInventoryInvoice } = productInventoryInvoice;
            delete abcd.productInventoryInvoiceMapper;
            result.push({
                ...abcd,
                slabData,
                productDetails,
                productInventoryInvoice: restProductInventoryInvoice,
            });
        } else {
            delete abcd.productInventoryInvoiceMapper;
            result.push({
                ...abcd,
                slabData,
                productDetails,
                productInventoryInvoice: null,
            });
        }
    }

    return result;
}



export async function getSelectionSheetDetails(selectionSheetId) {
    try {
        const opportunityDetails = await opportunitiyRepository.getSelectionSheetDetails(selectionSheetId);
        return opportunityDetails;
    } catch (error) {
        console.error('Error fetching opportunity details:', error);
        throw error;
    }
};

export async function updateSelectionSheet(selectionSheetId) {
    try {
        const opportunityDetails = await opportunitiyRepository.getSelectionSheetDetails(selectionSheetId);
        const poSlabDetailsArray = [];

        opportunityDetails.forEach(item => {
            poSlabDetailsArray.push({
                poSlabDetailId: item.poSlabDetailId,
            });
        });
        const updatePromises = poSlabDetailsArray.map(async (slabDetail) => {
            return await updateSlabDetails({
                poSlabDetailId: slabDetail.poSlabDetailId,
                status: 'ONHOLD',

            });
        });

        await Promise.all(updatePromises);

        return poSlabDetailsArray;
    } catch (error) {
        await transaction.rollback();
        console.error('Error fetching opportunity details or updating slab details:', error);
        throw error;
    }
}

//convert selection sheet to SO
export async function convertSelectionSheetToSO(selectionSheetId, createdBy, clientId) {
    console.log(createdBy, 'cystomer');

    try {
        const selectionSheetDetails = await opportunitiyRepository.getSelectionSheetDetails(selectionSheetId);
        console.log(selectionSheetDetails, 'detailss');

        if (selectionSheetDetails.length > 0) {
            const opportunityId = selectionSheetDetails[0].opportunityId;
            const opportunityDetails = await opportunitiyRepository.getOpportunityDetails({ opportunityId: opportunityId, clientId: clientId });

            const latestSoDetails = await getSoNumber(clientId);
            const salesOrderNumber = latestSoDetails.newSo;
            const salesOrderDate = latestSoDetails.todayDate;
            const opportunityData = opportunityDetails.dataValues;
            const salesOrderPayload = {
                customerId: opportunityData.customerId,
                so: salesOrderNumber,
                soDate: salesOrderDate,
                customerPo: opportunityData.customerPo,
                location: opportunityData.location,
                shipTo: opportunityData.shipTo,
                salesTax: opportunityData.salesTax,
                specialInstruction: opportunityData.specialInstruction,
                internalNotes: opportunityData.internalNotes,
                printedNotes: opportunityData.printedNotes,
                createdBy: createdBy,
                updatedBy: createdBy
            };

            const createSalesOrder = await createOrder(salesOrderPayload);
            const salesOrderId = createSalesOrder.dataValues.salesOrdersId;
            const selectedInventory = selectionSheetDetails.map((sheet) => {
                return {
                    productInventoryId: sheet.dataValues.productInventoryId,
                    selectedSlabs: [
                        {
                            poSlabDetailId: sheet.dataValues.poSlabDetailId
                        }
                    ],
                };
            });
            const transaction = await sequelize.transaction();
            const results = [];

            try {

                for (const inventory of selectedInventory) {
                    for (const slab of inventory.selectedSlabs) {
                        const productData = {
                            salesOrdersId: salesOrderId,
                            productInventoryId: inventory.productInventoryId,
                            poSlabDetailId: slab.poSlabDetailId,
                        };
                        const result = await addProduct(productData, { transaction });
                        results.push(result);
                    }
                }
                await transaction.commit();

                const updatePromises = selectedInventory.flatMap((inventory) =>
                    inventory.selectedSlabs.map((slab) =>
                        updateSlabDetails({
                            poSlabDetailId: slab.poSlabDetailId,
                            status: 'INACTIVE',
                        })
                    )
                );

                await Promise.all(updatePromises);
                console.log('Products successfully added to the sales order:', results);
            } catch (error) {
                await transaction.rollback();
                console.error('Error adding products to the sales order:', error);
                throw error;
            }
            console.log(selectedInventory, 'Selected inventory for adding products');

            return salesOrderId;
        } else {
            console.log('No opportunity details found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching opportunity details:', error);
        throw error;
    }
};



//convery opportunity to SO 
export async function convertOpportunityToSO(opportunityId, selectedSlabsData, createdBy, clientId) {
    try {
        // const clientId = 1;
        console.log(selectedSlabsData, 'data');

        const opportunityDetails = await opportunitiyRepository.getOpportunityDetails({ opportunityId, clientId: clientId });
        const selectedInventory = [];
        return await createSalesOrderWithProducts(opportunityDetails.dataValues, selectedInventory, clientId, selectedSlabsData);
    } catch (error) {
        console.error('Error fetching opportunity details:', error);
        throw error;
    }
}
