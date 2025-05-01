import { Transaction } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";

import * as containerRepository from "../repositories/container.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as poRepository from "../repositories/purchaseOrder.repository";
import * as requestedPurchaseProductsRepository from "../repositories/requestedPurchaseProduct.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as siplProductsRepository from "../repositories/siplProducts.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as journalEntryService from "../services/journalEntry.service";
import * as siplService from "../services/sipl.service";
import * as paymentBillRepository from "../repositories/paymentBills.repository";

// Processes the inventory reception by updating slab statuses.
export const receiveInventory = async (siplId: number, clientId: number): Promise<number> => {
  const transaction = await sequelize.transaction();

  try {
    // Update the status of all slabs in the SIPL to IN_INVENTORY.
    const updatedSlab = await slabRepository.updateSlabStatusBySipl(siplId, transaction);

    // Update SIPL inventoryReceived status.
    await siplRepository.updateSIPL(siplId, { inventoryReceived: true }, transaction);
    const calculations = await siplService.getSiplCalculations(siplId, transaction);

    // set landed unit cost for each slab.
    await Promise.all(
      calculations.dataAccordingToProduct.map(
        async (productCalc: any) =>
          await slabRepository.setUnitLandedCost(
            siplId,
            productCalc.product.id,
            productCalc.landedUnitCost,
            transaction
          )
      )
    );

    // Create Journal entry for Inventory Reception START.
    await journalEntryService.createJournalEntryForReceiveInventory(siplId, clientId, transaction);

    transaction.commit();
    return updatedSlab;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Create SIPL
export async function createSIPLService(siplData: any, transaction?: Transaction) {
  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction(); // Start a transaction
  }

  try {

    const combinedSiplKeys = await siplRepository.getCombinedSIPlNumber(siplData, transaction);

    // Create SIPL
    let sipl: any = await siplRepository.createSIPL({ ...siplData, ...combinedSiplKeys }, transaction);

    let container;
    if (siplData.container) {
      container = await addContainer({ number: siplData.container }, sipl.id, transaction);
    }

    const productsWithSIPLId: any[] = [];

    // Create SIPL Products (if provided)
    if (!siplData.products?.length) {
      throw new AppError("SIPL could not be created without products.", 400);
    }

    for (const product of siplData.products) {
      const existingProduct = await requestedPurchaseProductsRepository.findById(
        product.requestedPurchaseProductId,
        transaction
      );

      if (!existingProduct) {
        throw new Error(`Requested Product with ID ${product.requestedPurchaseProductId} not found in given PO.`);
      }

      productsWithSIPLId.push({
        ...product,
        siplId: sipl.id,
      });
    }

    await siplProductsRepository.createBulkSIPLProducts(productsWithSIPLId, transaction);

    // Create Journal entry for SIPL START.
    const siplJournalEntry = await journalEntryService.createJournalEntryForSIPL(sipl.id, siplData, transaction);
    // Create Journal entry for SIPL END.

    // Create Freight Detail (if provided)
    if (siplData.freightDetail) {
      await poRepository.createFreightDetail(siplData.freightDetail, { siplId: sipl.id }, transaction);
    }

    if (shouldCommitTransaction) await transaction.commit();
    return { sipl, container, siplJournalEntry };
  } catch (error: any) {
    if (shouldCommitTransaction) transaction.rollback();
    throw error;
  }
}

export const addContainer = async (containerData: Object, siplId: number, transaction?: Transaction) => {
  const container = await containerRepository.createContainer(
    {
      ...containerData,
      referenceType: "sipl",
      referenceId: siplId,
    },
    transaction
  );

  return container;
};

// Create slabs for SIPL
export async function handleCreateSlabs(slabData: any) {
  const transaction = await sequelize.transaction();

  try {
    if (!slabData.quantity || slabData.quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    const sipl: any = await siplRepository.findSIPLByIdSimple(slabData.siplId);

    if (!sipl) {
      throw new Error("SIPL not found.");
    }

    // Create a new InventoryProduct for each Slab
    const inventoryProducts: any = await inventoryProductRepository.createInventoryProducts(
      slabData.binId,
      slabData.quantity,
      transaction
    );

    const lastSerialNumber = await slabRepository.getLastSerialNumber(sipl.purchaseOrderId, slabData.siplId);
    let lastSlabNumber = await slabRepository.getLastSlabNumber(slabData.productId, slabData.siplId);

    if (slabData.slabNumber > lastSlabNumber) {
      lastSlabNumber = slabData.slabNumber;
    }

    // Pair each slab with its own inventory product
    const slabs = inventoryProducts.map((inventoryProduct: any, index: number) => ({
      ...slabData, // Ensure each slab has unique data
      inventoryProductId: inventoryProduct.id,
      purchaseOrderId: sipl.purchaseOrderId,
      serialNumber: lastSerialNumber + index + 1,
      slabNumber: lastSlabNumber + index + 1,
      barcode: uuidv4(),
      combinedSlabNumber: sipl.combinedSiplNumber + "-" + (lastSerialNumber + index + 1),
    }));

    const createdSlabs = await slabRepository.createSlabs(slabs, transaction);

    await transaction.commit();
    return createdSlabs;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
}

// Get new PO number
export const getInvoiceNumber = async () => {
  return await siplRepository.getInvoiceNumber();
};

// get SIPL by ID
export const getSIPLById = async (id: number) => {
  let sipl: any = await siplRepository.findSIPLById(id);

  if (!sipl) {
    throw new AppError("SIPL does not found", 400);
  }

  sipl = sipl?.get({ plain: true });

  if (!sipl) {
    throw new Error("SIPL not found");
  }

  // Calculate totalReceivedQuantity, totalPackagingQuantity
  sipl.siplProducts = sipl.siplProducts.map((siplProduct: any) => {
    return {
      ...siplProduct,
      totalReceivedQuantity: Number(
        siplProduct.slabs.reduce((a: number, b: any) => a + b.receivingWidth * b.receivingLength, 0).toFixed(2)
      ),
      totalPackagingQuantity: Number(
        siplProduct.slabs.reduce((a: number, b: any) => a + b.packageWidth * b.packageLength, 0).toFixed(2)
      ),
    };
  });

  // Calculate total for every bill.
  sipl.bills = sipl.bills.map((bill: any) => {
    const total = bill.billItems.reduce((total: number, billItem: any) => total + Number(billItem.amount), 0);
    return {
      ...bill,
      total,
    };
  });

  const calculations = await getSiplCalculations(id);

  let totalPaidBillAmount = 0;

  await Promise.all(
    sipl.bills.map(async (bill: any) => {
      totalPaidBillAmount += await paymentBillRepository.getTotalPaidAmountOfBill(
        bill.id,
        PAYMENT_BILL_REFERENCE_TYPES.BILL
      );
    })
  );

  const totalPaidSiplAmount = await paymentBillRepository.getTotalPaidAmountOfBill(
    sipl.id,
    PAYMENT_BILL_REFERENCE_TYPES.SIPL
  );

  return { ...sipl, ...calculations, totalPaidBillAmount, totalPaidSiplAmount };
};

// Get SIPL by ID
export const getSIPLByIdSimple = async (id: number) => {
  let sipl: any = await siplRepository.findSIPLByIdSimple(id);
  if (!sipl) {
    throw new AppError("SIPL does not found", 400);
  }
  sipl = sipl?.get({ plain: true });
  if (!sipl) {
    throw new Error("SIPL not found");
  }
  return sipl;
}

// Get all SIPLs
export const getAllSIPLs = async (page: number, limit: number) => {
  const { rows, count } = await siplRepository.getAllSIPLs(page, limit);

  return {
    total: count,
    page,
    limit,
    data: rows,
  };
};

// get common calculations for SIPL
export const getSiplCalculations = async (siplId: number, transaction?: Transaction) => {
  const siplData = (await siplRepository.findSIPLById(siplId, transaction))?.get({ plain: true });

  // Calculate other bills total amount.
  const totalBillsCharges = siplData.bills.reduce(
    (total: number, bill: any) =>
      total + bill.billItems.reduce((sum: number, billItem: any) => sum + Number(billItem.amount), 0),
    0
  );

  // Calculate total area of slabs that packaged.
  const totalPackagingArea = Number(
    siplData.siplProducts
      .reduce(
        (sum: number, siplProduct: any) =>
          sum +
          siplProduct.slabs.reduce((total: number, slab: any) => total + slab.packageLength * slab.packageWidth, 0),
        0
      )
      .toFixed(2)
  );

  // Total quantity exists in a SIPL
  const totalQuantity = siplData.siplProducts.reduce(
    (total: number, siplProduct: any) => total + siplProduct.quantity,
    0
  );

  // Total amount of a SIPL
  const totalAmount = siplData.siplProducts.reduce(
    (total: number, siplProduct: any) => total + siplProduct.quantity * siplProduct.unitPrice,
    0
  );

  // Calculate total area of slabs that received.
  const totalReceivingArea = Number(
    siplData.siplProducts
      .reduce(
        (sum: number, siplProduct: any) =>
          sum +
          siplProduct.slabs.reduce((total: number, slab: any) => total + slab.receivingLength * slab.receivingWidth, 0),
        0
      )
      .toFixed(2)
  );

  // Unit bill price as per total area of all product's slab.
  const unitBillPrice = Number((totalBillsCharges / totalReceivingArea));

  // Calculation according to product.
  const dataAccordingToProduct = siplData.siplProducts.map((siplProduct: any) => {
    // total received area as per product.
    const totalReceivedAreaPerProduct = Number(
      siplProduct.slabs.reduce((a: number, b: any) => a + Number(b.receivingWidth * b.receivingLength), 0).toFixed(2)
    );

    // total packaging area as per product.
    const totalPackagingAreaPerProduct = Number(
      siplProduct.slabs.reduce((a: number, b: any) => a + Number(b.packageWidth * b.packageLength), 0).toFixed(2)
    );

    // Total SIPL price as per product.
    const totalSIPLProductPrice = siplProduct.quantity * siplProduct.unitPrice;

    const unitCost = Number((totalSIPLProductPrice / totalReceivedAreaPerProduct));

    // Total unit charge is self unit charge + bill charge per unit area.
    const landedUnitCost = unitCost + unitBillPrice;

    return {
      siplProductId: siplProduct.id,
      product: {
        id: siplProduct.requestedPurchaseProduct.product.id,
        name: siplProduct.requestedPurchaseProduct.product.name,
      },

      siplProductQuantity: siplProduct.quantity,

      totalSlabs: siplProduct.slabs.length,
      totalPrice: totalSIPLProductPrice,

      totalReceivedArea: totalReceivedAreaPerProduct,
      totalPackagingArea: totalPackagingAreaPerProduct,

      unitCost,
      landedUnitCost,
    };
  });

  return {
    dataAccordingToProduct,
    totalBillsCharges,
    totalPackagingArea,
    totalReceivingArea,
    totalQuantity,
    totalAmount,
    unitBillCharge: unitBillPrice,
    inventoryReceived: siplData.inventoryReceived,
  };
};

export const getSIPLByVendor = async (vendorId: number) => {
  let sipls: any[] = await siplRepository.getSIPLByVendor(vendorId);

  sipls = await Promise.all(
    sipls.map(async (sipl) => {
      sipl = sipl.get({ plain: true });
      const calculations = await getSiplCalculations(sipl.id);

      return { ...sipl, totalAmount: calculations.totalAmount };
    })
  );

  return sipls;
};

// Get all barcode of an SIPL
export const getAllBarcode: any = async (siplId: number) => {
  console.log(siplId);
  return await slabRepository.getOnlyBarcode(siplId);
};

// Get new combined slab number
export const getNewCombinedSlabNumberService = async (siplId: number) => {
  return await slabRepository.getNewCombinedSlabNumber(siplId);
};
