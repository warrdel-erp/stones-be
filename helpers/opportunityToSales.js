import { addProduct, createOrder } from "../repository/salesOrderRepository.js";
import { getSoNumber } from "../services/salesOrderServices.js";
import sequelize from '../database/sequelizeConfig.js';
import { updateSlabDetails } from "../repository/purchaseOrderRepository.js";

export async function createSalesOrderWithProducts(opportunityDetails, selectedInventory, clientId, selectedSlabsData,soToCreateOf) {

    const latestSoDetails = await getSoNumber(clientId);
    const salesOrderNumber = latestSoDetails.newSo;
    const salesOrderDate = latestSoDetails.todayDate;

    const salesOrderPayload = {
        customerId: opportunityDetails.customerId,
        so: salesOrderNumber,
        soDate: salesOrderDate,
        customerPo: opportunityDetails.customerPo,
        location: opportunityDetails.location,
        shipTo: opportunityDetails.shipTo,
        salesTax: opportunityDetails.salesTax,
        specialInstruction: opportunityDetails.specialInstruction,
        internalNotes: opportunityDetails.internalNotes,
        printedNotes: opportunityDetails.printedNotes,
        createdBy: opportunityDetails.createdBy,
        updatedBy: opportunityDetails.updatedBy
    };

    const createSalesOrder = await createOrder(salesOrderPayload);

    const salesOrderId = createSalesOrder.dataValues.salesOrdersId;

    const transaction = await sequelize.transaction();
    const results = [];
    try {
        for (const slab of selectedSlabsData.slabs) {

            const productData = {
                salesOrdersId: salesOrderId,
                productInventoryId: slab.productInventoryId,
                poSlabDetailId: slab.poSlabDetailId,
            };

            const result = await addProduct(productData, { transaction });

            results.push(result);
        }


        await transaction.commit();


        const updatePromises = selectedSlabsData.slabs.map((slab) =>
            updateSlabDetails({
                poSlabDetailId: slab.poSlabDetailId,
                status: 'INACTIVE',
            }, { transaction })
        );

        await Promise.all(updatePromises);
        return salesOrderId;
    } catch (error) {

        await transaction.rollback();
        console.error('Error adding products to the sales order:', error);
        throw error;
    }

}
