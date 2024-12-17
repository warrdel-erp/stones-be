import * as returnReceiptRepository from '../repository/returnReceiptRepository.js';


export async function getSalesInvoices(search, clientId) {
    try {
        const salesInvoiceList = await returnReceiptRepository.getSalesInvoices(search, clientId);
        const invoicesList = salesInvoiceList.map((loadingDetails) => {

            const loadingData = loadingDetails.loadingOrders.map((data) => ({
                createdAt: new Date(data.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                salesOrdersId: data.salesOrdersId,
                soLoadingOrderId: data.soLoadingOrderId,
                salesStatus: data.salesStatus,
                subTotal: data.subTotal,
                shipTo: data.shipTo,
                location: data.location,
                customerPo: data.customerPo,
                total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total),
                tax: data.tax,
                customerName: loadingDetails.customers.customerName,
                customerId: loadingDetails.customers.customerId,
                so: loadingDetails.so,
                salesOrdersId: loadingDetails.salesOrdersId,
                salesTax: loadingDetails.salesTax,

            }));

            return {
                loadingOrders: loadingData,
                customerName: loadingDetails.customers.customerName,
                customerId: loadingDetails.customers.customerId,
                customerAddress: loadingDetails.customers.address,
                location: loadingDetails.location,
                so: loadingDetails.so,
                salesOrdersId: loadingDetails.salesOrdersId,
                salesTax: loadingDetails.salesTax,
                shipTo: loadingDetails.shipTo,
                location: loadingDetails.location,
                customerPo: loadingDetails.customerPo,
            };
        });

        return { salesInvoiceList, invoicesList };
    } catch (error) {
        console.error('Error fetching sales invoices:', error);
        throw error;
    }
}



export async function singleInvoiceDetails(search, clientId, queries) {
    try {
        const salesInvoiceList = await returnReceiptRepository.getSalesInvoices(search, clientId, queries);

        const invoicesByLoadingOrder = salesInvoiceList.reduce((acc, salesInventory) => {
            const customer = salesInventory.customers;
            const internalNotes = salesInventory.internalNotes;
            const printedNotes = salesInventory.printedNotes;
            const shipTo = salesInventory.shipTo;
            const location = salesInventory.location;

            let hasProductData = false;

            salesInventory.salesInventory.forEach((data) => {
                const soLoadingOrderId = data.soLoadingOrderId;
                const productName = data.salesProduct.salesProductDetails.productName;
                const slabCurrentStatus = data.slabDetails.status;

                if (slabCurrentStatus === 'RETURNED') {
                    return;
                }

                let loadingOrder = acc.find(order => order.soLoadingOrderId === soLoadingOrderId);

                if (!loadingOrder) {
                    loadingOrder = {
                        soLoadingOrderId,
                        products: [],
                        customerDetails: customer,
                        internalNotes: internalNotes,
                        printedNotes: printedNotes,
                        shipTo: shipTo,
                        location: location
                    };
                    acc.push(loadingOrder);
                }

                let product = loadingOrder.products.find(prod => prod.productName === productName);

                if (!product) {
                    product = {
                        productName,
                        items: [],
                        unitPrice: data.unitPrice
                    };
                    loadingOrder.products.push(product);
                }

                const loadingData = {
                    createdBy: data.createdBy,
                    poSlabDetailId: data.poSlabDetailId,
                    productInventoryId: data.productInventoryId,
                    remeasureLength: data.remeasureLength,
                    remeasureWidth: data.remeasureWidth,
                    salesOrdersId: data.salesOrdersId,
                    salesOrdersInventoryId: data.salesOrdersInventoryId,
                    productId: data.salesProduct.productId,
                    unitPrice: data.unitPrice,
                    soLoadingOrderId: data.soLoadingOrderId,
                    poSupplierInvoiceId: data.slabDetails.poSupplierInvoiceId,
                    poSupplierInvoiceMapperId: data.slabDetails.poSupplierInvoiceMapperId,
                    serialNumber: data.slabDetails.serialNumber,
                    block: data.slabDetails.block,
                    lot: data.slabDetails.lot,
                    bin: data.slabDetails.bin,
                    unitPrice: data.unitPrice,
                    quantity: `${data.remeasureLength} x ${data.remeasureWidth} = ${(data.remeasureLength * data.remeasureWidth / 144).toFixed(2)} SF`
                };

                product.items.push(loadingData);
                hasProductData = true;
            });

            if (!hasProductData) {
                acc.push({
                    soLoadingOrderId: 'No Product Data',
                    products: [],
                    customerDetails: customer,
                    internalNotes: internalNotes,
                    printedNotes: printedNotes,
                    shipTo: shipTo,
                    location: location
                });
            }

            return acc;
        }, []);

        return { invoicesByLoadingOrder, salesInvoiceList };
    } catch (error) {
        console.error('Error fetching sales invoices:', error);
        throw error;
    }
}



export async function addReturnSlabs(info) {
    const updatedSlabs = await Promise.all(info.poSlabDetailIds.map(async (id) => {
        return await returnReceiptRepository.updateSlabDetails(id, 'RETURNED');
    }));
    return updatedSlabs;
}



export async function getReturnInvoice(search, clientId, queries) {

    try {
        const repoResponse = await returnReceiptRepository.getReturnInvoice(search, clientId, queries);
        const invoicesByLoadingOrder = repoResponse.reduce((acc, salesInventory) => {
            const customers = salesInventory.customers;
            salesInventory.salesInventory.forEach((data) => {
                const soLoadingOrderId = data.soLoadingOrderId;
                const productName = data.salesProduct.salesProductDetails.productName;
                let loadingOrder = acc.find(order => order.soLoadingOrderId === soLoadingOrderId);

                if (!loadingOrder) {
                    loadingOrder = {
                        soLoadingOrderId,
                        customerId: customers.customerId,
                        customerName: customers.customerName,
                        contactName: customers.contactName,
                        customerType: customers.customerType,
                        printName: customers.printName,
                        parentCustomer: customers.parentCustomer,
                        primaryPhoneNumber: customers.primaryPhoneNumber,
                        secondaryPhoneNumber: customers.secondaryPhoneNumber,
                        landlineNumber: customers.landlineNumber,
                        accEmail: customers.accEmail,
                        emails: customers.emails,
                        address: customers.address,
                        paymentTerms: `${customers.paymentTerms} 'days'`,
                        products: [],
                        shipTo: salesInventory.shipTo,
                        purchaseLocation: salesInventory.location,
                        customers: customers
                    };
                    acc.push(loadingOrder);
                }
                let product = loadingOrder.products.find(prod => prod.productName === productName);

                if (!product) {
                    product = {
                        productName,
                        items: []
                    };
                    loadingOrder.products.push(product);
                }


                const loadingData = {
                    createdBy: data.createdBy,
                    poSlabDetailId: data.poSlabDetailId,
                    productInventoryId: data.productInventoryId,
                    remeasureLength: data.remeasureLength,
                    remeasureWidth: data.remeasureWidth,
                    salesOrdersId: data.salesOrdersId,
                    salesOrdersInventoryId: data.salesOrdersInventoryId,
                    productId: data.salesProduct.productId,
                    unitPrice: data.unitPrice,
                    soLoadingOrderId: data.soLoadingOrderId,
                    poSupplierInvoiceId: data.slabDetails.poSupplierInvoiceId,
                    poSupplierInvoiceMapperId: data.slabDetails.poSupplierInvoiceMapperId,
                    serialNumber: data.slabDetails.serialNumber,
                    lot: data.slabDetails.lot,
                    bin: data.slabDetails.bin,
                    // block: block.slabDetails.block,
                    quantity: `${data.remeasureLength} x ${data.remeasureWidth} = ${(data.remeasureLength * data.remeasureWidth / 144).toFixed(2)} SF`,
                };

                product.items.push(loadingData);
            });

            return acc;
        }, []);

        return { repoResponse, invoicesByLoadingOrder };
    } catch (error) {
        console.error('Error fetching return invoice:', error);
        throw new Error('Failed to fetch return invoice');
    }
}

