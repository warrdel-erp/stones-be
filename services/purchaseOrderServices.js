import sequelize from '../database/sequelizeConfig.js';
import * as purchaseOrderRepository from '../repository/purchaseOrderRepository.js'
import * as slabpurchaseOrderRepository from '../repository/supplierInvoiceMapperRepository.js'
import * as productInventory from '../repository/productInventoryRespository.js'
import { getAccountIdByAccountName } from './accountsServices.js';
import { getPrePurchaseProductDetails, updatePrePurchaseProductDetails } from '../repository/prePurchaseRepository.js';
import { findUserId } from '../repository/clientUserRepository.js';
import { getFreightData } from '../repository/freightRepository.js';
export async function createOrder(info) {
    return await purchaseOrderRepository.createOrder(info)
}

export async function getPoNumber(clientId) {
    const result = await purchaseOrderRepository.latestPoNumber(clientId);
    console.log(result, 'ssss');

    const newPo = result + 1;
    console.log(newPo, 'newpo');
    return newPo;
}

export async function updateOrder(poNumber, info) {
    return await purchaseOrderRepository.updateOrder(poNumber, info)
}

export async function addPurchaseOrderProduct(dataArray) {
    const transaction = await sequelize.transaction();
    try {
        const results = [];

        for (const data of dataArray) {
            let result;
            const purchaseOrderProduct = {
                purchaseOrderId: data.purchaseOrderId,
                productId: data.productId,
                createdBy: data.createdBy
            };

            result = await purchaseOrderRepository.createPurchaseProductOrder(purchaseOrderProduct, transaction);
            const purchaseOrderProductId = result.get('purchaseOrderProductId');
            const info = { ...data, purchaseOrderProductId: purchaseOrderProductId };
            result = await purchaseOrderRepository.createPrePurchaseOrder(info, transaction);
            results.push(result);
        }

        // Commit the transaction if all inserts succeed
        await transaction.commit();
        return { success: true, message: 'Data inserted successfully', results };
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error inserting data:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllPo(data) {
    return await purchaseOrderRepository.getAllPurchaseOrder(data)
}

// single po complete details  page

export async function singlePoDetails(purchaseOrderId) {
    try {
        const allDetailsPurchaseOrderId = await purchaseOrderRepository.getSinglePurchaseOrder(purchaseOrderId);
        return allDetailsPurchaseOrderId;
    } catch (error) {
        throw new Error(`Failed to fetch purchase ${purchaseOrderId} order details: ${error.message}`);
    }
};

// add supplier Invoice
export async function addSuplierInvoice(data) {
    console.log(data.createdBy, 'data');

    const transaction = await sequelize.transaction();
    const getLatestTranscationNumber = await purchaseOrderRepository.latestTranscationNumber(data.purchaseOrderId);
    let transcationNumber
    if (!(getLatestTranscationNumber)) {
        transcationNumber = `SIPL ${data.po} -1`
    } else {
        const latestTranscationNumber = getLatestTranscationNumber.dataValues.transaction
        transcationNumber = `SIPL ${data.po} ${parseInt(latestTranscationNumber.split(" ")[2]) - 1}`
    }
    try {
        const results = [];
        let result;
        const info = {
            finalTotalCharges: data.finalTotalCharges,
            totalProductCharges: data.totalProductCharges,
            otherChargesTotal: data.otherChargesTotal,
            invoice: data.invoice,
            transaction: transcationNumber,
            purchaseOrderId: data.purchaseOrderId,
            invoiceDate: data.invoiceDate,
            shipDate: data.shipDate,
            dueDate: data.dueDate,
            createdBy: data.createdBy
        };

        result = await purchaseOrderRepository.createSupplierInvoiceMapper(info, transaction);
        const poSupplierInvoiceMappperId = result.get('poSupplierInvoiceMappperId')
        for (const dataArray of data.productDeatils) {
            const supplierData = { ...dataArray, poSupplierInvoiceMappperId: poSupplierInvoiceMappperId };
            const prePurchaseOrderId = supplierData.prePurchaseOrderId;
            console.log(prePurchaseOrderId, 'prepurchaseorderis');

            //for update the prepurchaseorder product details
            const prePurchaseProductDetails = await getPrePurchaseProductDetails(prePurchaseOrderId);
            const requestedQuantity = supplierData.quantity;
            const savedQuantity = prePurchaseProductDetails.dataValues.quantity;
            const updatedQuantity = savedQuantity - requestedQuantity;
            await updatePrePurchaseProductDetails({
                quantity: updatedQuantity,
                prePurchaseOrderId: prePurchaseOrderId,
                transaction: transaction
            });
            result = await purchaseOrderRepository.createSupplierInvoice(supplierData, transaction);
            results.push(result);
        }

        // Commit the transaction if all inserts succeed
        await transaction.commit();
        return { success: true, message: 'Data inserted successfully', results };
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error inserting data:', error);
        return { success: false, error: error.message };
    }
}

// add slab details

export async function addSlabDetails(info) {
    try {
        const { slabCounter, po, isBlockIncreament, iisLotIncreament, isSlabIncreament, block, lot, poSupplierInvoiceMapperId, slab, siplNumber, ...slabInfo } = info;

        const slabDetails = [];

        const siplNumberMatch = siplNumber.match(/-\s*(\d+)/);
        const siplNumberAfterHyphen = siplNumberMatch ? parseInt(siplNumberMatch[1], 10) : null;

        let latestSerialNumber = await purchaseOrderRepository.latestSlapSerialNumber(poSupplierInvoiceMapperId)
        let serialCounter = 0;


        if (latestSerialNumber) {
            const serialNumberParts = latestSerialNumber.dataValues.serialNumber.split('-');
            const lastPart = serialNumberParts[serialNumberParts.length - 1];
            serialCounter = parseInt(lastPart, 10);
        }

        for (let i = 0; i < slabCounter; i++) {

            let dynamicBlock = block;
            let dynamicLot = lot;
            let dynamicSlab = slab;

            // If flags is true, Increase the value
            if (isBlockIncreament) dynamicBlock += i;
            if (iisLotIncreament) dynamicLot += i;
            if (isSlabIncreament) dynamicSlab += i;

            // Generate a dynamic po convert to serial Number
            // const dynamicPo = serialCounter ? `${po}- ${siplNumberAfterHyphen}-${serialCounter + i}` : `${po}-${i}`;
            const dynamicPo = `${po}-${siplNumberAfterHyphen}-${serialCounter + i + 1}`;
            console.log(dynamicPo, 'dynamicPO');

            // Create a new slab
            const slabDetail = await purchaseOrderRepository.addSlabDetails({
                ...slabInfo,
                serialNumber: dynamicPo,
                block: isBlockIncreament ? dynamicBlock : block,
                lot: iisLotIncreament ? dynamicLot : lot,
                slab: isSlabIncreament ? dynamicSlab : slab,
                slabCounter: slabCounter,
                poSupplierInvoiceMapperId: poSupplierInvoiceMapperId
            });
            slabDetails.push(slabDetail); // Push the slab detail In array
        }
        return slabDetails;
    } catch (error) {
        throw error;
    }
}

// get Slab Details

export async function singleSlabDetails(purchaseOrderId, poSupplierInvoiceMappperId) {
    try {
        const slabDetails = await slabpurchaseOrderRepository.getSlabDetailByInvoiceMapper(poSupplierInvoiceMappperId);
        const allDetailsPurchaseOrderId = await purchaseOrderRepository.getSinglePurchaseOrder(purchaseOrderId);
        const poSupplierInvoiceId = slabDetails.supplierInvoice[0].poSupplierInvoiceId;
        console.log(poSupplierInvoiceId, 'jsjsjsjjsjs');

        const detailsToFindIds = { poSupplierInvoiceMapperId: Number(poSupplierInvoiceMappperId), poSupplierInvoiceId: Number(poSupplierInvoiceId) };
        console.log(detailsToFindIds, 'ksksksksk');
        const freightDetails = await getFreightData(detailsToFindIds);
        console.log(freightDetails, 'freidhdhdh');
        const freightTotalSum = freightDetails.reduce((acc, bill) => {
          return acc + (bill.dataValues.total || 0);
        }, 0);
        
        console.log(`Total Sum: $${freightTotalSum}`);
        

        const po = allDetailsPurchaseOrderId.dataValues.po;
        const supplierSo = allDetailsPurchaseOrderId.dataValues.supplierSo;
        const freightForwarder = allDetailsPurchaseOrderId.dataValues.freightForwarder
        const etaDate = allDetailsPurchaseOrderId.dataValues.etaDate
        const container = allDetailsPurchaseOrderId.dataValues.container
        const etdPort = allDetailsPurchaseOrderId.dataValues.etdPort
        const supplierName = allDetailsPurchaseOrderId.dataValues.suppliers.supplierName
        const shipLocation = allDetailsPurchaseOrderId.dataValues.location.location
        const purchaseLocation = allDetailsPurchaseOrderId.dataValues.purchaseLocation.location
        const invoice = allDetailsPurchaseOrderId.dataValues.invoiceMapper[0].invoice
        const invoiceDate = allDetailsPurchaseOrderId.dataValues.invoiceMapper[0].invoiceDate
        const dueDate = allDetailsPurchaseOrderId.dataValues.invoiceMapper[0].dueDate
        const shipDate = allDetailsPurchaseOrderId.dataValues.invoiceMapper[0].shipDate
        const paymentTerm = allDetailsPurchaseOrderId.dataValues.paymentTerm
        const supplierId = allDetailsPurchaseOrderId.dataValues.supplierId;
        const parentLocation = allDetailsPurchaseOrderId.dataValues.suppliers.parentLocation;
        const printName = allDetailsPurchaseOrderId.dataValues.suppliers.printName;
        const remitAddress = allDetailsPurchaseOrderId.dataValues.suppliers.remitAddress;
        const remitSuite = allDetailsPurchaseOrderId.dataValues.suppliers.remitSuite;
        const remitCity = allDetailsPurchaseOrderId.dataValues.suppliers.remitCity;
        const remitState = allDetailsPurchaseOrderId.dataValues.suppliers.remitState;
        const remitZip = allDetailsPurchaseOrderId.dataValues.suppliers.remitZip;
        const remitCountry = allDetailsPurchaseOrderId.dataValues.suppliers.remitCountry;
        const shippingAddress = allDetailsPurchaseOrderId.dataValues.suppliers.shippingAddress;
        const shippingSuite = allDetailsPurchaseOrderId.dataValues.suppliers.shippingSuite;
        const shippingCity = allDetailsPurchaseOrderId.dataValues.suppliers.shippingCity;
        const shippingState = allDetailsPurchaseOrderId.dataValues.suppliers.shippingState;
        const shippingZip = allDetailsPurchaseOrderId.dataValues.suppliers.shippingZip;
        const shippingCountry = allDetailsPurchaseOrderId.dataValues.suppliers.shippingCountry;
        const allSlabDetails = { shippingZip, shippingCountry, shippingState, shippingCity, shippingSuite, shippingAddress, remitCountry, remitZip, remitState, remitSuite, remitCity, printName, remitAddress, printName, parentLocation, slabDetails, po, supplierSo, freightForwarder, etaDate, container, etdPort, supplierName, shipLocation, purchaseLocation, invoice, invoiceDate, dueDate, shipDate, paymentTerm, supplierId,freightTotalSum };


        return allSlabDetails;
    } catch (error) {
        throw new Error(`Failed to fetch slab Details ${purchaseOrderId} && ${poSupplierInvoiceMappperId}: ${error.message}`);
    }
};

// add product inventory 
export async function addProductInventory(dataArray) {
    console.log(dataArray.createdBy, 'dataArray');

    const poMapperId = parseInt(dataArray.poSupplierInvoiceMapperId);
    const transaction = await sequelize.transaction();
    const accNames = { creditAccountName: 'Trade Payables', debitAccountName: 'Cost Of Sales' }
    try {
        const transactionAccontId = await getAccountIdByAccountName(accNames);
        console.log(transactionAccontId, 'transactionAccontId');
        if (dataArray.transactionAmountType = 'debit') {
            const accountDetails = [
                { accountsId: transactionAccontId.debitAccount.accountId, entryType: 'dr' },
                { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' }
            ];
            for (const accountDetail of accountDetails) {
                const transactionDataWithAccount = {
                    ...dataArray,
                    accountsId: accountDetail.accountsId,
                    entryType: accountDetail.entryType,
                    transactionOf: 'purchase',
                    transactionAmountType: 'debit',
                    createdBy: dataArray.createdBy
                };
                await purchaseAccountTransaction(transactionDataWithAccount, transaction);
            }
        }
        const inventoryDetails = await productInventory.getInventoryDetailsBySupplierInvoiceMapperId(poMapperId)
        console.log(inventoryDetails, 'inventorydetails');
        const values = inventoryDetails.supplierInvoice.map(item => ({
            productId: item.supplierPurchaseProduct.product_id,
            slab: item.slab,
            quantity: item.quantity,
            po_supplier_invoice_id: item.dataValues.po_supplier_invoice_id,
        }));
        const results = [];
        for (const data of values) {
            const productDetails = await productInventory.getProductDetailsOfProductInventory(data.productId) // product Inventory
            let result;
            result = await purchaseOrderRepository.updateReceivingInventory(poMapperId, transaction);
            if (productDetails) {
                const { slabInStock: productSlabInStock, quantityInStock: productQuantityInStock, productInventoryId } = productDetails.dataValues;
                const { slab: newSlabInStock, quantity: newQuantityInStock } = data;
                const updateData = {
                    slabInStock: productSlabInStock + newSlabInStock,
                    quantityInStock: productQuantityInStock + newQuantityInStock,
                    productId: data.productId,
                    createdBy: dataArray.createdBy
                };
                result = await productInventory.updateProductInventory(updateData, transaction)
                const inventoryData = { poSupplierInvoiceId: data.po_supplier_invoice_id, productInventoryId, createdBy: dataArray.createdBy }
                result = await productInventory.addInventoryInvoice(inventoryData, transaction)
                const info = { ...data, poSupplierInvoiceMapperId: data.poSupplierInvoiceMapperId };
                // result = await productInventory.addProductInventory(info, transaction);
            } else {
                const info = { ...data, poSupplierInvoiceMapperId: data.poSupplierInvoiceMapperId, createdBy: dataArray.createdBy };
                result = await productInventory.addProductInventory(info, transaction);
                const productInventoryId = result.get('productInventoryId')
                const inventoryData = { poSupplierInvoiceId: data.po_supplier_invoice_id, productInventoryId: productInventoryId, createdBy: dataArray.createdBy }
                result = await productInventory.addInventoryInvoice(inventoryData, transaction)
            };
            results.push(result);
        };
        // Commit the transaction if all inserts succeed
        await transaction.commit();
        return { success: true, message: 'Data inserted successfully', results };
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error inserting data:', error);
        throw error;
    };
};

export async function getProductInventory(page, limit, clientId) {
    let result = [];
    const data = await productInventory.getInventoryList(page, limit, clientId);
    for (const abc of data) {
        const abcd = abc.toJSON();
        const slabData = [].concat(...abcd?.productInventoryInvoiceMapper?.map(pim => {
            return pim?.productInventoryInvoice?.slabDetails || [];
        }));
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
};

// add payment

export async function addPayment(info) {
    return await purchaseOrderRepository.addPayment(info)
};

// get payment details 

export async function getPaymentDetails(poSupplierInvoiceMappperId) {
    return await purchaseOrderRepository.getPaymentDetails(poSupplierInvoiceMappperId)
};

// add container

export async function addContainer(info) {
    return await purchaseOrderRepository.addContainer(info)
};

// get container details 

export async function getContainerDetails(poSupplierInvoiceMappperId) {
    return await purchaseOrderRepository.getContainerDetails(poSupplierInvoiceMappperId)
};


//purchase account transaction
export async function purchaseAccountTransaction(transactionData) {
    const transaction = await sequelize.transaction();
    const accNames = { debitAccountName: 'Trade Payables', creditAccountName: 'Cost Of Sales' }
    try {
        if (transactionData.transactionAmountType === 'credit') {
            const transactionAccontId = await getAccountIdByAccountName(accNames);
            const accountDetails = [
                { accountsId: transactionAccontId.debitAccount.accountId, entryType: 'dr' },
                { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' },
                { accountsId: transactionData.paymentMethod, entryType: 'cr' }
            ];
            for (const accountDetail of accountDetails) {
                const transactionDataWithAccount = {
                    ...transactionData,
                    accountsId: accountDetail.accountsId,
                    entryType: accountDetail.entryType,
                    transactionOf: 'purchase',
                    transactionAmountType: 'credit',
                    createdBy: transactionData.createdBy
                };
                await purchaseOrderRepository.purchaseAccountTransaction(transactionDataWithAccount, { transaction });
            }
        }
        else {
            await purchaseOrderRepository.purchaseAccountTransaction(transactionData, transaction);
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error('Failed to process transaction:', error);
        throw error;
    }
}

export async function getCOATransactionDetails(queryParams) {
    let transactionData;
    if (queryParams) {
        transactionData = await purchaseOrderRepository.getCOATransactionDetails(queryParams);
    } else {
        transactionData = await purchaseOrderRepository.getCOATransactionDetails();
    }
    const filterAccountsWithTransactions = (data) => {
        return data.filter(account => account.account_transactions && account.account_transactions.length > 0);
    };

    const calculateSums = (transactions) => {
        return transactions.reduce((acc, transaction) => {
            if (transaction.entryType === 'dr') {
                acc.debit += transaction.transactionAmount || 0;
            } else if (transaction.entryType === 'cr') {
                acc.credit += transaction.transactionAmount || 0;
            }
            return acc;
        }, { debit: 0, credit: 0 });
    };

    const accountsWithTransactions = filterAccountsWithTransactions(transactionData);

    const processedAccounts = accountsWithTransactions.map(account => {
        const { debit, credit } = calculateSums(account.account_transactions);
        const balance = credit - debit;
        return {
            accountName: account.accountName,
            accountsId: account.accountsId,
            coaCode: account.coaCode,
            accountBalance: account.accountBalance,
            debitAmount: debit,
            creditAmount: credit,
            balance: balance,
            account_transactions: account.account_transactions,
        };
    });

    return processedAccounts;
}


export async function getInventoryListBasedOnSipl(clientId) {
    const inventoryJsonData = await productInventory.getInventoryListBasedOnSipl(clientId);
    return inventoryJsonData;
}


export async function updateSlabDetails(data) {
    const results = await Promise.all(
        data.slabs.map(async (slab) => {
            return await purchaseOrderRepository.updateSlabDetails(slab);
        })
    );
    return results;
}


//delete prepurchase order product

export async function deletePrePurchaeProducts(purchaseOrderProductId) {
    return await purchaseOrderRepository.deletePrePurchaeProduct(purchaseOrderProductId);
};


export async function updatePrePurchaseProduct(data) {
    return await updatePrePurchaseProductDetails(data);
};