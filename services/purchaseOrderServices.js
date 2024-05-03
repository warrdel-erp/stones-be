import sequelize from '../database/sequelizeConfig.js';
import * as purchaseOrderRepository from '../repository/purchaseOrderRepository.js'
import * as slabpurchaseOrderRepository from '../repository/supplierInvoiceMapperRepository.js'

export async function createOrder(info){
    return await purchaseOrderRepository.createOrder(info)
}

export async function getPoNumber(){
    const result = await purchaseOrderRepository.latestPoNumber()
    let newPo; // declare newPo outside the if-else blocks
    if (!result) {
        newPo = "0001";
    } else {
        let lastPo = parseInt(result.get('po'));
        newPo = String(lastPo + 1).padStart(4, '0');
    }
    return newPo;
}

export async function updateOrder(poNumber, info){
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
            const info = {...data, purchaseOrderProductId: purchaseOrderProductId};
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

export async function getAllPo(search){
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
}

// add supplier Invoice
export async function addSuplierInvoice(data) {
    const transaction = await sequelize.transaction();
    const getLatestTranscationNumber = await purchaseOrderRepository.latestTranscationNumber(data.purchaseOrderId);
    let transcationNumber
    if(!(getLatestTranscationNumber)){
        transcationNumber = `SIPL ${data.po} -1`
        }else{
            const latestTranscationNumber = getLatestTranscationNumber.dataValues.transaction
            transcationNumber = `SIPL ${data.po} ${parseInt(latestTranscationNumber.split(" ")[2]) -1}`  
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
                purchaseOrderId:data.purchaseOrderId,
                invoiceDate:data.invoiceDate,
                shipDate:data.shipDate,
                dueDate:data.dueDate,
            };

            result = await purchaseOrderRepository.createSupplierInvoiceMapper(info, transaction);
            const poSupplierInvoiceMappperId  = result.get('poSupplierInvoiceMappperId')
        for (const dataArray of data.productDeatils) {
            const supplierData = {...dataArray,poSupplierInvoiceMappperId:poSupplierInvoiceMappperId}
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
        const { slabCounter, po, isBlockIncreament, iisLotIncreament, isSlabIncreament, block, lot,poSupplierInvoiceMapperId, slab, ...slabInfo } = info;

        const slabDetails = [];

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
            const dynamicPo = serialCounter ? `${po}-${serialCounter + i}`: `${po}-${i}`;
            // Create a new slab
            const slabDetail = await purchaseOrderRepository.addSlabDetails({
                ...slabInfo,
                serialNumber: dynamicPo,
                block: isBlockIncreament ? dynamicBlock : block,
                lot: iisLotIncreament ? dynamicLot : lot,
                slab: isSlabIncreament ? dynamicSlab : slab,
                slabCounter:slabCounter,
                poSupplierInvoiceMapperId:poSupplierInvoiceMapperId
            });
            slabDetails.push(slabDetail); // Push the slab detail In array
        }
        return slabDetails;
    } catch (error) {
        throw error;
    }
}

// get Slab Details

export async function singleSlabDetails(poNumber,poSupplierInvoiceMappperId) {
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
        const allSlabDetails = { slabDetails, po, supplierSo, freightForwarder, etaDate, container, etdPort, supplierName, shipLocation, purchaseLocation, invoice, invoiceDate, dueDate, shipDate, paymentTerm };
        return allSlabDetails;
        } catch (error) {
        throw new Error(`Failed to fetch slab Details ${poNumber} && ${poSupplierInvoiceMappperId}: ${error.message}`);
    }
}
