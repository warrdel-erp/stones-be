import sequelize from '../database/sequelizeConfig.js';
import * as purchaseOrderRepository from '../repository/purchaseOrderRepository.js'
import * as slabpurchaseOrderRepository from '../repository/supplierInvoiceMapperRepository.js'
import * as productInventory from '../repository/productInventoryRespository.js'
import { getAccountIdByAccountName } from './accountsServices.js';
import { getPrePurchaseProductDetails, updatePrePurchaseProductDetails } from '../repository/prePurchaseRepository.js';
import { findUserId } from '../repository/clientUserRepository.js';
import { getFreightData } from '../repository/freightRepository.js';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js'
import fs from 'fs';
import poSlabDetailModel from '../models/poSlabDetailModel.js';
import { createSalesOrderWithProducts } from '../helpers/opportunityToSales.js';

// const fs = require('fs');
export async function createOrder(info) {
    return await purchaseOrderRepository.createOrder(info)
}

export async function getPoNumber(clientId) {
    const result = await purchaseOrderRepository.latestPoNumber(clientId);
    const newPo = result + 1;
    return newPo;
}

export async function updateOrder(poNumber, info) {
    return await purchaseOrderRepository.updateOrder(poNumber, info)
}

export async function addPurchaseOrderProduct(dataArray) {

    const transaction = await sequelize.transaction();
    try {
        const results = [];

        for (const data of dataArray.Products) {
            let result;
            const purchaseOrderProduct = {
                purchaseOrderId: data.purchaseOrderId,
                productId: data.productId,
                createdBy: data.createdBy
            };

            // Create the purchase order product
            result = await purchaseOrderRepository.createPurchaseProductOrder(purchaseOrderProduct, transaction);
            const purchaseOrderProductId = result.get('purchaseOrderProductId');
            const info = { ...data, purchaseOrderProductId: purchaseOrderProductId, poQty: data.quantity };

            // Create the pre-purchase order
            result = await purchaseOrderRepository.createPrePurchaseOrder(info, transaction);

            // Check if there are other charges and add them if they exist
            if (dataArray.othercharge && dataArray.othercharge.length > 0) {

                const otherCharges = dataArray.othercharge.map(charge => ({
                    ...charge,
                    createdBy: data.createdBy
                }));

                // Add the other charges
                result = await purchaseOrderRepository.addOtherCharges(otherCharges, transaction);
            }

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
        if (!allDetailsPurchaseOrderId) {
            throw new Error(`Purchase order with ID ${purchaseOrderId} not found.`);
        }
        let totalPercentage = 0;
        let totalInvoices = allDetailsPurchaseOrderId.invoiceMapper.length;
        const enrichedInvoiceMapper = allDetailsPurchaseOrderId.invoiceMapper.map((invoice) => {
            let percentage = 0;
            if (invoice.poSupplierInvoice && invoice.poSupplierInvoice.length > 0) {
                percentage += 30;
            }
            if (invoice.invoiceContainers && invoice.invoiceContainers.length > 0) {
                percentage += 30;
            }
            if (invoice.totalProductCharges && invoice.totalProductCharges > 0) {
                percentage += 40;
            }
            percentage = Math.min(percentage, 100);
            totalPercentage += percentage;
            return {
                ...invoice,
                poCurrentStatus: percentage,
                percentage,
            };
        });
        const averagePoCurrentStatus = totalInvoices > 0 ? Math.round(totalPercentage / totalInvoices) : 0;
        const enrichedResult = {
            ...allDetailsPurchaseOrderId,
            invoiceMapper: enrichedInvoiceMapper,
            poCurrentStatus: averagePoCurrentStatus,
            percentage: averagePoCurrentStatus,
        };

        return enrichedResult;
    } catch (error) {
        throw new Error(`Failed to fetch purchase order ${purchaseOrderId} details: ${error.message}`);
    }
}

// add supplier Invoice
export async function addSuplierInvoice(data) {
    const transaction = await sequelize.transaction();
    const accNames = { creditAccountName: 'Trade Payables', debitAccountName: 'Other Inventory, Gross ' }
    const transactionAccontId = await getAccountIdByAccountName(accNames);

    const accountDetails = { accountsId: transactionAccontId.creditAccount.accountId, entryType: 'cr' };

    const transactionDataWithAccount = {
        supplierId: data.supplierId,
        accountsId: accountDetails.accountsId,
        entryType: accountDetails.entryType,
        transactionOf: 'purchase',
        transactionAmountType: 'debit',
        transactionAmount: data.totalProductCharges,
        transactionAmountDate: new Date(),
        createdBy: data.createdBy,
        purchaseOrderId: data.purchaseOrderId

    };
    await purchaseOrderRepository.purchaseAccountTransaction(transactionDataWithAccount);

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
            createdBy: data.createdBy,
            // transactionStatus: 'SIPL CREATED'
        };

        result = await purchaseOrderRepository.createSupplierInvoiceMapper(info, transaction);
        const poSupplierInvoiceMappperId = result.get('poSupplierInvoiceMappperId')
        for (const dataArray of data.productDeatils) {
            const supplierData = { ...dataArray, poSupplierInvoiceMappperId: poSupplierInvoiceMappperId };
            const prePurchaseOrderId = supplierData.prePurchaseOrderId;


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
            const accountDetails = { accountsId: transactionAccontId.debitAccount.accountId, entryType: 'dr' };
            const transactionDataWithAccount = {
                supplierId: data.supplierId,
                accountsId: accountDetails.accountsId,
                entryType: accountDetails.entryType,
                transactionOf: 'purchase',
                transactionAmountType: 'debit',
                transactionAmount: dataArray.totalPerUnit,
                transactionAmountDate: new Date(),
                createdBy: data.createdBy,
                purchaseOrderId: data.purchaseOrderId,
                poSupplierInvoiceMappperId: poSupplierInvoiceMappperId

            };
            await purchaseOrderRepository.purchaseAccountTransaction(transactionDataWithAccount);
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

        let latestSerialNumber = await purchaseOrderRepository.latestSlapSerialNumber(poSupplierInvoiceMapperId);
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

            // Increment based on flags and ensure values are treated as numbers
            if (isBlockIncreament) dynamicBlock = parseInt(block, 10) + i;
            if (iisLotIncreament) dynamicLot = parseInt(lot, 10) + i;
            if (isSlabIncreament) dynamicSlab = parseInt(slab, 10) + i;

            // Increment serial counter correctly and ensure it's unique
            let currentSerial = serialCounter + i + 1;
            let dynamicPo = `${po}-${siplNumberAfterHyphen}-${currentSerial}`;

            // Check if the serial number already exists in the database
            let existingSerialNumber = await poSlabDetailModel.findOne({
                where: { serialNumber: dynamicPo, poSupplierInvoiceMapperId: poSupplierInvoiceMapperId },
            });

            // If the serial number exists, increment it until it's unique
            while (existingSerialNumber) {
                currentSerial += 1;  // Increment serial number
                dynamicPo = `${po}-${siplNumberAfterHyphen}-${currentSerial}`;

                // Check again for uniqueness
                existingSerialNumber = await poSlabDetailModel.findOne({
                    where: { serialNumber: dynamicPo, poSupplierInvoiceMapperId: poSupplierInvoiceMapperId },
                });
            }

            const barcode = `WDP${po}${siplNumberAfterHyphen}${currentSerial}${dynamicBlock}${dynamicLot}${dynamicSlab}`;
            // Create a new slab detail
            const slabDetail = await purchaseOrderRepository.addSlabDetails({
                ...slabInfo,
                serialNumber: dynamicPo,
                block: dynamicBlock,
                lot: dynamicLot,
                slab: dynamicSlab,
                slabCounter: slabCounter,
                poSupplierInvoiceMapperId: poSupplierInvoiceMapperId,
                barcode: barcode
            });

            slabDetails.push(slabDetail);

            await purchaseOrderRepository.siplTransactionStatusUpdate({
                poSupplierInvoiceMappperId: poSupplierInvoiceMapperId,
                transactionStatus: 'SLAB ADDED'
            });
        }

        // const productDeatils = await slabpurchaseOrderRepository.getSlabDetailByInvoiceMapper(poSupplierInvoiceMapperId);

        for (const slab of slabDetails) {
            const slabData = `
                Serial_Number:${slab.dataValues.serialNumber},
                Block:${slab.dataValues.block},
                Lot:${slab.dataValues.lot},
                Slab:${slab.dataValues.slab},
                Slab_Counter:${slab.dataValues.slabCounter},
                Package_Length:${slab.dataValues.packageLength},
                Package_Width:${slab.dataValues.packageWidth},
                Receiving_Length:${slab.dataValues.recevingLength},
                Receiving_Width:${slab.dataValues.recevingWidth},
                Bin:${slab.dataValues.bin},
                Barcode:${slab.dataValues.barcode},
                PO_Supplier_Invoice_Mapper_ID:${slab.dataValues.poSupplierInvoiceMapperId},
                PO_Slab_Detail_ID:${slab.dataValues.poSlabDetailId},
                Created_By:${slab.dataValues.createdBy},
                Status:${slab.dataValues.status}
            `.trim();

            const cleanSlabData = slabData.replace(/\n/g, ' ').replace(/\s+/g, ' ');
            const qrCodeData = JSON.stringify(cleanSlabData);
            const qrCode = await QRCode.toDataURL(qrCodeData);


            slab.dataValues.qrCode = qrCode;
            await QRCode.toFile(`public/qrCodes/slabQRCode-${slab.dataValues.poSlabDetailId}-${slab.dataValues.poSupplierInvoiceMapperId}.png`, qrCodeData);

            const barcodeData = slabData;;
            const barcodeBuffer = await bwipjs.toBuffer({
                bcid: 'code128',
                text: barcodeData,
                scale: 3,
                height: 10,
                includetext: true,
                textxalign: 'center',
                background: 'white',
                color: 'black',
            });
            fs.writeFileSync(`public/barCodes/slabbarCode-${slab.dataValues.poSlabDetailId}-${slab.dataValues.poSupplierInvoiceMapperId}.png`, barcodeBuffer);
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

        const freightData = await getFreightData(({ poSupplierInvoiceMapperId: poSupplierInvoiceMappperId }))
        const allDetailsPurchaseOrderId = await purchaseOrderRepository.getSinglePurchaseOrder(purchaseOrderId);
        const poSupplierInvoiceId = slabDetails.supplierInvoice.poSupplierInvoiceId;

        const detailsToFindIds = { poSupplierInvoiceMapperId: Number(poSupplierInvoiceMappperId), poSupplierInvoiceId: Number(poSupplierInvoiceId) };
        const freightDetails = await getFreightData(detailsToFindIds);
        const freightTotalSum = freightDetails.reduce((acc, bill) => {
            return acc + (bill.dataValues.total || 0);
        }, 0);

        const po = allDetailsPurchaseOrderId.po;
        const supplierSo = allDetailsPurchaseOrderId.supplierSo;
        const freightForwarder = allDetailsPurchaseOrderId.freightForwarder;
        const etaDate = allDetailsPurchaseOrderId.etaDate;
        const container = allDetailsPurchaseOrderId.container;
        const etdPort = allDetailsPurchaseOrderId.etdPort;
        const supplierName = allDetailsPurchaseOrderId.suppliers?.supplierName || "Unknown";
        const shipLocation = allDetailsPurchaseOrderId.location?.location || "Unknown";
        const purchaseLocation = allDetailsPurchaseOrderId.purchaseLocation?.location || "Unknown";
        const invoice = allDetailsPurchaseOrderId.invoiceMapper?.[0]?.invoice || "No Invoice";
        const invoiceDate = allDetailsPurchaseOrderId.invoiceMapper?.[0]?.invoiceDate || null;
        const dueDate = allDetailsPurchaseOrderId.invoiceMapper?.[0]?.dueDate || null;
        const shipDate = allDetailsPurchaseOrderId.invoiceMapper?.[0]?.shipDate || null;
        const paymentTerm = allDetailsPurchaseOrderId.paymentTerm || "Unknown";
        const supplierId = allDetailsPurchaseOrderId.supplierId;
        const parentLocation = allDetailsPurchaseOrderId.suppliers?.parentLocation || "Unknown";
        const printName = allDetailsPurchaseOrderId.suppliers?.printName || "Unknown";
        const remitAddress = allDetailsPurchaseOrderId.suppliers?.remitAddress || "Unknown";
        const remitSuite = allDetailsPurchaseOrderId.suppliers?.remitSuite || "Unknown";
        const remitCity = allDetailsPurchaseOrderId.suppliers?.remitCity || "Unknown";
        const remitState = allDetailsPurchaseOrderId.suppliers?.remitState || "Unknown";
        const remitZip = allDetailsPurchaseOrderId.suppliers?.remitZip || "Unknown";
        const remitCountry = allDetailsPurchaseOrderId.suppliers?.remitCountry || "Unknown";
        const shippingAddress = allDetailsPurchaseOrderId.suppliers?.shippingAddress || "Unknown";
        const shippingSuite = allDetailsPurchaseOrderId.suppliers?.shippingSuite || "Unknown";
        const shippingCity = allDetailsPurchaseOrderId.suppliers?.shippingCity || "Unknown";
        const shippingState = allDetailsPurchaseOrderId.suppliers?.shippingState || "Unknown";
        const shippingZip = allDetailsPurchaseOrderId.suppliers?.shippingZip || "Unknown";
        const shippingCountry = allDetailsPurchaseOrderId.suppliers?.shippingCountry || "Unknown";

        const allSlabDetails = { freightData, shippingZip, shippingCountry, shippingState, shippingCity, shippingSuite, shippingAddress, remitCountry, remitZip, remitState, remitSuite, remitCity, printName, remitAddress, printName, parentLocation, slabDetails, po, supplierSo, freightForwarder, etaDate, container, etdPort, supplierName, shipLocation, purchaseLocation, invoice, invoiceDate, dueDate, shipDate, paymentTerm, supplierId, freightTotalSum };

        return allSlabDetails;
    } catch (error) {
        throw new Error(`Failed to fetch slab Details ${purchaseOrderId} && ${poSupplierInvoiceMappperId}: ${error.message}`);
    }
};

// add product inventory 
export async function addProductInventory(dataArray) {
    const poMapperId = parseInt(dataArray.poSupplierInvoiceMapperId);
    const transaction = await sequelize.transaction();
    const accNames = { creditAccountName: 'Inventory in Transit', debitAccountName: 'Finished Goods' }
    try {
        const transactionAccontId = await getAccountIdByAccountName(accNames);
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
        const inventoryDetails = await productInventory.getInventoryDetailsBySupplierInvoiceMapperId(poMapperId)
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

                const landedCostData = dataArray.landedCostData.find(item => item.productId === data.productId);
                if (landedCostData) {
                    const landedCostInfo = {
                        productId: landedCostData.productId,
                        productLandedCost: parseFloat(landedCostData.totalLandedCost),
                        poSupplierInvoiceMapperId: poMapperId,
                        createdBy: dataArray.createdBy
                    };
                    await purchaseOrderRepository.createProductLandedCost(landedCostInfo, transaction); // Insert landed cost
                }
                // result = await productInventory.addProductInventory(info, transaction);
            } else {
                const info = { ...data, poSupplierInvoiceMapperId: data.poSupplierInvoiceMapperId, createdBy: dataArray.createdBy };
                result = await productInventory.addProductInventory(info, transaction);
                const productInventoryId = result.get('productInventoryId')
                const inventoryData = { poSupplierInvoiceId: data.po_supplier_invoice_id, productInventoryId: productInventoryId, createdBy: dataArray.createdBy }
                result = await productInventory.addInventoryInvoice(inventoryData, transaction);
                const landedCostData = dataArray.landedCostData.find(item => item.productId === data.productId);
                if (landedCostData) {
                    const landedCostInfo = {
                        productId: landedCostData.productId,
                        productLandedCost: parseFloat(landedCostData.totalLandedCost),
                        poSupplierInvoiceMapperId: poMapperId,
                        createdBy: dataArray.createdBy
                    };
                    await purchaseOrderRepository.createProductLandedCost(landedCostInfo, transaction);
                }
            };
            results.push(result);
        };
        await purchaseOrderRepository.siplTransactionStatusUpdate({
            poSupplierInvoiceMappperId: poMapperId,
            transactionStatus: 'INVENTORY RECEIVED'
        });
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
    try {
        const containerResult = await purchaseOrderRepository.addContainer(info);
        await purchaseOrderRepository.siplTransactionStatusUpdate({
            poSupplierInvoiceMappperId: info.poSupplierInvoiceMapperId,
            transactionStatus: 'CONTAINER ADDED'
        });
        return containerResult;
    } catch (error) {
        console.error('Error adding container:', error);
        throw error;
    }
}


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
    // const landedCost= await productInventory.getLandedCost();
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


export async function getSupplierInvoices(data) {
    const siplsData = await purchaseOrderRepository.getSupplierInvoices(data);
    return siplsData
};


export async function addToCart(info) {
    try {
        const slabStatusUpdate = await purchaseOrderRepository.updateSlabDetails({
            poSlabDetailId: info.poSlabDetailId,
            slabAddedToCart: 1,
        });

        const addToCartResponse = await purchaseOrderRepository.addToCart(info);
        return addToCartResponse;
    } catch (error) {
        console.error('Error in addToCart:', error);
        throw error;
    }
}

export async function deleteCartItem(info) {
    const cartData = await purchaseOrderRepository.findCartById(info.cartId)
    const poSlabDetailId = cartData?.dataValues?.poSlabDetailId
    const slabStatusUpdate = await purchaseOrderRepository.updateSlabDetails({
        poSlabDetailId: poSlabDetailId,
        slabAddedToCart: 0,
    });
    return await purchaseOrderRepository.deleteCartItem(info)
}

export async function getCartItems(info, createdBy) {
    return await purchaseOrderRepository.getCartItems(info, createdBy)
}



export async function convertCartItemToHold(info) {
    try {
        const { poSlabDetailsArray } = info;

        const updatePromises = poSlabDetailsArray.map(async (slabDetail) => {
            const updatedSlab = await purchaseOrderRepository.updateSlabDetails({
                poSlabDetailId: slabDetail.poSlabDetailId,
                status: 'ONHOLD',
            });

            return {
                poSlabDetailId: slabDetail.poSlabDetailId,
                status: 'ONHOLD',
                success: !!updatedSlab
            };
        });

        const results = await Promise.all(updatePromises);
        return {
            success: true,
            data: results
        };

    } catch (error) {
        console.error('Error in convertCartItemToHold:', error);
        throw error;
    }
}


export async function convertCartItemToSO(data, createdBy, clientId) {
    const soToCreateOf = 'ADDED_CART_ITEM'
    return await createSalesOrderWithProducts(data, createdBy, clientId, soToCreateOf)
}

export async function getSuppliersPOJournal(info) {
    try {
        const supplierJournal = await purchaseOrderRepository.getSuppliersPOJournal(info);
        const transformedSupplierJournal = supplierJournal.map(supplier => {
            const supplierData = supplier.toJSON();
            if (Array.isArray(supplierData.supplierTransactions)) {
                supplierData.supplierTransactions = supplierData.supplierTransactions.map(transaction => {
                    const transformedTransaction = { ...transaction };
                    if (transaction.entryType === 'dr') {
                        transformedTransaction.debitAmount = `$${transaction.transactionAmount}`;
                    } else if (transaction.entryType === 'cr') {
                        transformedTransaction.creditAmount = `$${transaction.transactionAmount}`;
                    }

                    delete transformedTransaction.transactionAmount;

                    return transformedTransaction;
                });
            }

            return supplierData;
        });

        return transformedSupplierJournal;
    } catch (error) {
        console.error("Error fetching purchase transactions:", error);
        throw new Error('Failed to fetch purchase transactions');
    }
}

export async function slabLocationTransfer(info) {
    try {
        const { poSlabDetailIds, ...restOfInfo } = info;
        if (!Array.isArray(poSlabDetailIds) || poSlabDetailIds.length === 0) {
            throw new Error("poSlabDetailIds must be a non-empty array");
        }
        const results = [];
        for (let poSlabDetailId of poSlabDetailIds) {
            const transferData = { ...restOfInfo, poSlabDetailId };
            const result = await purchaseOrderRepository.slabLocationTransfer(transferData);
            results.push(result);
        }
        return results;
    } catch (error) {
        console.error("Error in slabLocationTransfer:", error);
        throw error;
    }
}

export async function getSlabInfo(poSlabDetailId) {
    return await purchaseOrderRepository.getSlabInfo(poSlabDetailId)
}
