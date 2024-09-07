import * as returnReceiptRepository from '../repository/returnReceiptRepository.js';


export async function getSalesInvoices(search, clientId) {
    try {
        const salesInvoiceList = await returnReceiptRepository.getSalesInvoices(search, clientId);
        const invoicesList = salesInvoiceList.map((loadingDetails) => {
            const loadingData = loadingDetails.loadingOrders.map((data) => ({
                createdAt: data.createdAt,
                salesOrdersId: data.salesOrdersId,
                soLoadingOrderId: data.soLoadingOrderId,
                salesStatus: data.salesStatus,
                subTotal: data.subTotal,
                total: data.total,
                tax: data.tax,
                customerName: loadingDetails.customers.customerName,
                customerId: loadingDetails.customers.customerId,
                so: loadingDetails.so,
                salesOrdersId: loadingDetails.salesOrdersId,
                salesTax: loadingDetails.salesTax
            }));
            return {
                loadingOrders: loadingData,
                customerName: loadingDetails.customers.customerName,
                customerId: loadingDetails.customers.customerId,
                so: loadingDetails.so,
                salesOrdersId: loadingDetails.salesOrdersId,
                salesTax: loadingDetails.salesTax
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
            salesInventory.salesInventory.forEach((data) => {
                const soLoadingOrderId = data.soLoadingOrderId;
                const productName = data.salesProduct.salesProductDetails.productName;

                let loadingOrder = acc.find(order => order.soLoadingOrderId === soLoadingOrderId);

                if (!loadingOrder) {
                    loadingOrder = {
                        soLoadingOrderId,
                        products: []
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
                    unitPrice: data.unitPrice,
                    quantity: `${data.remeasureLength} x ${data.remeasureWidth} = ${(data.remeasureLength * data.remeasureWidth / 144).toFixed(2)} SF`
                };
                product.items.push(loadingData);
            });

            return acc;
        }, []);

        return { invoicesByLoadingOrder };
    } catch (error) {
        console.error('Error fetching sales invoices:', error);
        throw error;
    }
}


export async function addReturnSlabs(info) {
    console.log(info);
    const updatedSlabs = await Promise.all(info.poSlabDetailIds.map(async (id) => {
        return await returnReceiptRepository.updateSlabDetails(id, 'RETURNED');
    }));
    return updatedSlabs;
}



export async function getReturnInvoice(search, clientId,queries) {
    console.log(search, clientId,queries,'jsjsjjsjsj');
    
    try {
        const repoResponse = await returnReceiptRepository.getReturnInvoice(search, clientId,queries);
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
                        paymentTerms:`${customers.paymentTerms} 'days'`,
                        products: []
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

