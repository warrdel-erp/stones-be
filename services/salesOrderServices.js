import * as salesOrderRepository from '../repository/salesOrderRepository.js';
import moment from 'moment';
import sequelize from '../database/sequelizeConfig.js';
import { updateProductInventoryInactive } from '../repository/productInventoryRespository.js';

export async function createOrder(info){
    return await salesOrderRepository.createOrder(info)
}

export async function getSoNumber(){
    const result = await salesOrderRepository.latestPoNumber()
    let newSo; // declare newSo outside the if-else blocks
    if (!result) {
        newSo = "0001";
    } else {
        let lastPo = parseInt(result.get('so'));
        newSo = String(lastPo + 1).padStart(4, '0');
    }
    const todayDate = moment().format('YYYY-MM-DD');
    return {newSo, todayDate};
}

// single so complete details  page

export async function singleSoDetails(soNumber) {
    try {
        const allDetailsPurchaseOrderId = await salesOrderRepository.getSingleSalesOrder(soNumber);
        return allDetailsPurchaseOrderId;
    } catch (error) {
        throw new Error(`Failed to fetch sales ${soNumber} order details: ${error.message}`);
    }
}

export async function addProduct(info) {
    const transaction = await sequelize.transaction();
    try {
        let results = [];
        let tax;
        let total;

        // Handle tax calculations and order update
        const salesOrderId = info.salesOrdersId;
        for (const inventory of info.selectedInventory) {
            tax = inventory.isTax // this is true false if true then calculate 
            if (tax) {
                const salesTax = await salesOrderRepository.getsalestax(salesOrderId, { transaction });
                const taxPercentage = parseFloat(salesTax) / 100;
                tax = info.subTotal * taxPercentage;
                total = info.subTotal + tax;
                const data = { subTotal: info.subTotal, total: total, tax: tax };
                await salesOrderRepository.updateOrder(salesOrderId, data, { transaction });
            }else{
                const data = { subTotal: info.subTotal, total: info.total};
                await salesOrderRepository.updateOrder(salesOrderId, data, { transaction });
            }
        }

        // Loop through inventories and slabs to add products
        for (const inventory of info.selectedInventory) {
            for (const slab of inventory.selectedSlabs) {
                const productData = {
                    salesOrdersId: info.salesOrdersId,
                    productInventoryId: inventory.productInventoryId,
                    poSlabDetailId: slab.poSlabDetailId,
                    unitPrice: inventory.unitPrice,
                };
                const result = await salesOrderRepository.addProduct(productData, { transaction });
                results.push(result);
            }
        }

        // Commit the transaction if all operations succeed
        await transaction.commit();
        return { success: true, message: 'Products added successfully', results };
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error adding products:', error);
        return { success: false, error: error.message };
    }
};


export async function loadingOrder(info) {
    const transaction = await sequelize.transaction();
    try {
        let result, soLoadingOrderId, updateResults = [];
        let tax;
        let total;

        // Handle tax calculations and loading order creation
        const salesOrderId = info.salesOrdersId;
        if (info.isTax) {
            const salesTax = await salesOrderRepository.getsalestax(salesOrderId, { transaction });
            const taxPercentage = parseFloat(salesTax) / 100;
            tax = info.subTotal * taxPercentage;
            total = info.subTotal + tax;
            const data = { subTotal: info.subTotal, total: total, tax: tax, salesOrdersId: salesOrderId ,salesStatus: 'LOADING ORDER'};
            result = await salesOrderRepository.createLoadingOrder(data, { transaction });
            soLoadingOrderId = result.get('soLoadingOrderId');
        }else{
            const data = { subTotal: info.subTotal, total: info.total, salesOrdersId: salesOrderId ,salesStatus: 'LOADING ORDER'};
            result = await salesOrderRepository.createLoadingOrder(data, { transaction });
            soLoadingOrderId = result.get('soLoadingOrderId');
        }

        // Loop through inventories to update sales order inventory
        for (const inventory of info.selectedInventory) {
            const updateData = {
                remeasureLength: inventory.remeasureLength,
                remeasureWidth: inventory.remeasureWidth,
                soLoadingOrderId: soLoadingOrderId,
                salesStatus: 'LOADING ORDER'
            };
            const updateResult = await salesOrderRepository.updateSalesOrderInventory(inventory.salesOrdersInventoryId, updateData, { transaction });
            updateResults.push(updateResult);
        }

        // Commit the transaction if all operations succeed
        await transaction.commit();
        return { success: true, message: 'Loading order processed successfully', updateResults };
    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error processing loading order:', error);
        return { success: false, error: error.message };
    }
};

export async function getAllSo(search) {
    try {
        const salesOrders = await salesOrderRepository.getAllSalesOrder(search);
        return salesOrders;
    } catch (error) {
        console.error('Error fetching sales orders:', error);
        throw error;
    }
}

export async function updateStatus(soLoadingOrderId) {
    const transaction = await sequelize.transaction();
    try {
        const salesOrderInventory = await salesOrderRepository.findSalesOrdersInventory(soLoadingOrderId, { transaction });

        if (salesOrderInventory.length === 0) {
            console.log(`No sales order inventory found with id ${soLoadingOrderId}`);
            await transaction.rollback();
            return { success: false, message: `No sales order inventory found with id ${soLoadingOrderId}` };
        }

        const statusMapping = {
            'INITIATED': 'LOADING ORDER',
            'LOADING ORDER': 'PACKING LIST',
            'PACKING LIST': 'INVOICE'
        };
        
        let data = {};
        for (const salesOrderInventories of salesOrderInventory) {
            data = {
                salesOrdersInventoryId: salesOrderInventories.dataValues.salesOrdersInventoryId,
                productInventoryId: salesOrderInventories.dataValues.productInventoryId,
                status: salesOrderInventories.dataValues.salesStatus,
            }
        }

        const currentStatus = data.status;
        const productInventoryId = data.productInventoryId;
        const newStatus = statusMapping[currentStatus];

        if (newStatus) {
            const updateResult = await salesOrderRepository.updateSalesStatus(data.salesOrdersInventoryId, { salesStatus: newStatus }, { transaction });
            console.log(`Status updated in sales order inventory and new status is: ${newStatus}`);

            await salesOrderRepository.updateSalesStatusLoadingOrder(soLoadingOrderId, { salesStatus: newStatus }, { transaction });
            console.log(`Status updated in so loading order and new status is: ${newStatus}`);

            let productInventoryUpdateResult = null;
            if (newStatus === 'INVOICE') {
                productInventoryUpdateResult = await updateProductInventoryInactive(productInventoryId, { status: 'INACTIVE' }, { transaction });
                console.log(`Product inventory with id ${productInventoryId} set to INACTIVE`);
            }

            // Commit the transaction if all operations succeed
            await transaction.commit();
            return {
                success: true,
                salesOrderUpdateResult: updateResult,
                productInventoryUpdateResult: productInventoryUpdateResult
            };

        } else {
            console.log(`No update required for status: ${currentStatus}`);
            await transaction.rollback();
            return { message: `No update required because the current status value is: ${currentStatus}` };
        }

    } catch (error) {
        // Rollback the transaction if any error occurs
        await transaction.rollback();
        console.error('Error updating status:', error);
        return { success: false, error: error.message };
    }
};