import sequelize from '../database/sequelizeConfig.js';
import * as purchaseOrderRepository from '../repository/purchaseOrderRepository.js'
import * as slabpurchaseOrderRepository from '../repository/supplierInvoiceMapperRepository.js'
import * as productInventory from '../repository/productInventoryRespository.js'
import { getAccountIdByAccountName } from './accountsServices.js';

export async function createOrder(info) {
    return await purchaseOrderRepository.createOrder(info)
}

export async function getPoNumber() {
    const result = await purchaseOrderRepository.latestPoNumber()
    let newPo;
    if (!result) {
        newPo = "0001";
    } else {
        let lastPo = parseInt(result.get('po'));
        newPo = String(lastPo + 1).padStart(4, '0');
    }
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

export async function getAllPo(search) {
    return await purchaseOrderRepository.getAllPurchaseOrder(search)
}

// single po complete details  page

export async function singlePoDetails(poNumber) {
    try {
        const allDetailsPurchaseOrderId = await purchaseOrderRepository.getSinglePurchaseOrder(poNumber);
        return allDetailsPurchaseOrderId;
    } catch (error) {
        throw new Error(`Failed to fetch purchase ${poNumber} order details: ${error.message}`);
    }
};

// add supplier Invoice
export async function addSuplierInvoice(data) {
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
        };

        result = await purchaseOrderRepository.createSupplierInvoiceMapper(info, transaction);
        const poSupplierInvoiceMappperId = result.get('poSupplierInvoiceMappperId')
        for (const dataArray of data.productDeatils) {
            const supplierData = { ...dataArray, poSupplierInvoiceMappperId: poSupplierInvoiceMappperId }
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
        let serialCounter;
        if (latestSerialNumber) {
            const SerialNumberParts = latestSerialNumber.dataValues.serialNumber
            const splitLatestNumber = SerialNumberParts.split('-');
            serialCounter = parseInt(splitLatestNumber[1]); // Increment the counter
        }

        for (let i = 1; i <= slabCounter; i++) {

            let dynamicBlock = block;
            let dynamicLot = lot;
            let dynamicSlab = slab;

            // If flags is true, Increase the value
            if (isBlockIncreament) dynamicBlock += i - 1;
            if (iisLotIncreament) dynamicLot += i - 1;
            if (isSlabIncreament) dynamicSlab += i - 1;

            // Generate a dynamic po convert to serial Number
            const dynamicPo = serialCounter ? `${po}- ${siplNumberAfterHyphen}-${serialCounter + i}` : `${po}-${i}`;
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

export async function singleSlabDetails(poNumber, poSupplierInvoiceMappperId) {
    try {
        const slabDetails = await slabpurchaseOrderRepository.getSlabDetailByInvoiceMapper(poSupplierInvoiceMappperId);
        const allDetailsPurchaseOrderId = await purchaseOrderRepository.getSinglePurchaseOrder(poNumber);
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
        const supplierId = allDetailsPurchaseOrderId.dataValues.supplierId
        const allSlabDetails = { slabDetails, po, supplierSo, freightForwarder, etaDate, container, etdPort, supplierName, shipLocation, purchaseLocation, invoice, invoiceDate, dueDate, shipDate, paymentTerm, supplierId };
        return allSlabDetails;
    } catch (error) {
        throw new Error(`Failed to fetch slab Details ${poNumber} && ${poSupplierInvoiceMappperId}: ${error.message}`);
    }
};

// add product inventory 
export async function addProductInventory(dataArray) {
    const poMapperId = parseInt(dataArray.poSupplierInvoiceMapperId);
    const transaction = await sequelize.transaction();
    // const accNames = { creditAccountName: 'Trade Payables', debitAccountName: 'Cost Of Sales' }
    try {
        // const transactionAccontId = await getAccountIdByAccountName(accNames);
        // console.log(transactionAccontId, 'transactionAccontId');
        // if (dataArray.transactionAmountType = 'debit') {
        //     const accountDetails = [
        //         { accountsId: transactionAccontId.debitAccount.accountId, entryType: 'dr' },
        //         { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' }
        //     ];
        //     for (const accountDetail of accountDetails) {
        //         const transactionDataWithAccount = {
        //             ...dataArray,
        //             accountsId: accountDetail.accountsId,
        //             entryType: accountDetail.entryType,
        //             transactionOf: 'purchase',
        //             transactionAmountType: 'debit'
        //         };
        //         await purchaseAccountTransaction(transactionDataWithAccount, transaction);
        //     }
        // }
        const inventoryDetails = await productInventory.getInventoryDetailsBySupplierInvoiceMapperId(poMapperId)
        // console.log(inventoryDetails, 'inventorydetails');
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
                    productId: data.productId
                };
                result = await productInventory.updateProductInventory(updateData, transaction)
                const inventoryData = { poSupplierInvoiceId: data.po_supplier_invoice_id, productInventoryId }
                result = await productInventory.addInventoryInvoice(inventoryData, transaction)
                const info = { ...data, poSupplierInvoiceMapperId: data.poSupplierInvoiceMapperId };
                // result = await productInventory.addProductInventory(info, transaction);
            } else {
                const info = { ...data, poSupplierInvoiceMapperId: data.poSupplierInvoiceMapperId };
                result = await productInventory.addProductInventory(info, transaction);
                const productInventoryId = result.get('productInventoryId')
                const inventoryData = { poSupplierInvoiceId: data.po_supplier_invoice_id, productInventoryId: productInventoryId }
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

export async function getProductInventory(page, limit) {
    let result = [];
    const data = await productInventory.getInventoryList(page, limit);
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
                { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' }
            ];
            for (const accountDetail of accountDetails) {
                const transactionDataWithAccount = {
                    ...transactionData,
                    accountsId: accountDetail.accountsId,
                    entryType: accountDetail.entryType,
                    transactionOf: 'purchase',
                    transactionAmountType: 'credit'
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
export async function getInventoryListBasedOnSipl() {
    const inventoryJsonData = await productInventory.getInventoryListBasedOnSipl();

    if (Array.isArray(inventoryJsonData)) {
        const flattenedInventoryData = inventoryJsonData.map((product) => {
            const basicInfo = {
                productName: product.dataValues.productName,
                type: product.dataValues.type,
                baseColor: product.dataValues.baseColor,
                origin: product.dataValues.origin,
                kind: product.dataValues.kind,
            };

            // Flatten the salesProductDetails and their nested arrays
            const flattenedDetails = product.dataValues.salesProductDetails.map((detail) => {
                const inventoryInfo = {
                    slabInStock: detail.slabInStock,
                    quantityInStock: detail.quantityInStock,
                    slabAvailable: detail.slabAvailable,
                    quantityAvailable: detail.quantityAvailable,
                };

                const transactions = detail.productInventory.flatMap((inventory) => {
                    const transactionInfo = inventory.productInventoryInvoice.supplierInvoicess.map((invoice) => {
                        return {
                            transaction: invoice.transaction,
                            invoice: invoice.invoice,
                            invoiceDate: invoice.invoiceDate,
                            shipDate: invoice.shipDate,
                            dueDate: invoice.dueDate,
                            receivingInventory: invoice.receivingInventory,
                            siplSlabDetails: invoice.siplSlabDetails.map((slabDetail) => ({
                                poSlabDetailId: slabDetail.poSlabDetailId,
                                serialNumber: slabDetail.serialNumber,
                                entryUnit: slabDetail.entryUnit,
                                packageLength: slabDetail.packageLength,
                                packageWidth: slabDetail.packageWidth,
                                recevingLength: slabDetail.recevingLength,
                                recevingWidth: slabDetail.recevingWidth,
                                block: slabDetail.block,
                                lot: slabDetail.lot,
                                slab: slabDetail.slab,
                                bin: slabDetail.bin,
                                notes: slabDetail.notes,
                                slabCounter: slabDetail.slabCounter,
                                barcode: slabDetail.barcode,
                            })),
                        };
                    });
                    return transactionInfo;
                });

                return { ...basicInfo, ...inventoryInfo, transactions };
            });

            return flattenedDetails;
        });
        const result = flattenedInventoryData.flat();
        console.log('Flattened Inventory Data:', result);
        return result;
    } else {
        console.log('Unexpected data structure:', inventoryJsonData);
        return []; 
    }
}



export async function updateSlabDetails(data) {
    const results = await Promise.all(
        data.slabs.map(async (slab) => {
            return await purchaseOrderRepository.updateSlabDetails(slab);
        })
    );
    return results;
}