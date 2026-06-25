import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import { AppError } from "../helper/appError";
import { PAYMENT_BILL_REFERENCE_TYPES, SIPL_STATUS, CREDIT_NOTE_REFERENCE_TYPES } from "../constants/tableTypes";
import * as models from "../models";

import * as containerRepository from "../repositories/container.repository";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as poRepository from "../repositories/purchaseOrder.repository";
import * as requestedPurchaseProductsRepository from "../repositories/requestedPurchaseProduct.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as siplProductsRepository from "../repositories/siplProducts.repository";
import * as slabRepository from "../repositories/slab.repository";
import * as journalEntryService from "../services/journalEntry.service";
import * as siplService from "../services/sipl.service";
import * as slabService from "../services/slab.service";
import * as paymentBillRepository from "../repositories/paymentBills.repository";
import { PAYMENT_TERMS, INVENTORY_ITEM_STATUS } from "../constants";
import { randomId, sumDecimal, isSIPLLocked } from "../helper";
import * as genericProductRepository from "../repositories/genericProduct.repository";
import * as productRepository from "../repositories/product.repository";
import * as tradeServiceService from "../services/tradeService.service";
import { TRADE_SERVICE_REFERENCE_TYPES } from "../models/tradeService.model";
import _ from "lodash";
import * as decimal from "../helper/decimal";
import {
  decimalAdd,
  decimalDivide,
  decimalGreaterThan,
  decimalMultiply,
} from "../helper/decimal";

// Processes the inventory reception by updating slab and generic product statuses.
export const receiveInventory = async (siplId: number, receivedDate: string, clientId: number, locationId: number): Promise<number> => {
  const transaction = await sequelize.transaction();

  try {
    const sipl = await siplRepository.findSIPLByIdSimple(siplId);
    if (!sipl) {
      throw new AppError("SIPL not found.", 404);
    }
    if (isSIPLLocked(sipl)) {
      throw new AppError("Cannot receive inventory. The SIPL is locked (received or canceled).", 400);
    }

    // Check if all slabs are fully filled before receiving inventory
    const slabsCheck = await slabService.checkSiplSlabsFullyFilled(siplId);

    if (!slabsCheck.allFilled) {
      throw new AppError(
        `Cannot receive inventory. ${slabsCheck.message}. Unfilled slab IDs: ${slabsCheck.unfilledSlabIds.join(', ')}`,
        400
      );
    }

    // Update the status of all slabs in the SIPL to IN_INVENTORY.
    const updatedSlab = await slabRepository.updateSlabStatusBySipl(siplId, transaction);

    // Update the status of all generic products in the SIPL to IN_INVENTORY.
    const updatedGenericProduct = await genericProductRepository.updateGenericProductStatusBySipl(siplId, transaction);

    if (!(updatedSlab + updatedGenericProduct)) {
      throw new AppError("No slab and generic product exists.", 400);
    }

    // Update SIPL inventoryReceived status.
    await siplRepository.updateSIPL(siplId, { inventoryReceived: true, receivedDate }, transaction);
    const calculations = await siplService.getSiplCalculations(siplId, transaction);

    // Set landed unit cost and FOB cost for each product in inventory products
    await Promise.all(
      calculations.dataAccordingToProduct.map(
        async (productCalc: any) => {
          // Update landed unit cost and FOB cost in inventory products (not in slabs or generic products)
          return await inventoryProductRepository.setInventoryProductLandedUnitCostAndFOBcost(
            siplId,
            productCalc.product.id,
            productCalc.landedUnitCost,
            productCalc.unitCost,
            transaction
          );
        }
      )
    );

    // Update all related inventory products to IN_INVENTORY and set receivedDate
    await inventoryProductRepository.updateInventoryProductStatusBySipl(
      siplId,
      INVENTORY_ITEM_STATUS.IN_INVENTORY,
      receivedDate,
      transaction
    );

    // Create Journal entry for Inventory Reception START.
    await journalEntryService.createJournalEntryForReceiveInventory(siplId, clientId, transaction, locationId);

    transaction.commit();
    return updatedSlab + updatedGenericProduct; // Return total count of updated items
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

// Create SIPL
export async function createSIPLService(siplData: any, locationId: number, transaction?: Transaction,) {
  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction(); // Start a transaction
  }

  try {

    const combinedSiplKeys = await siplRepository.getCombinedSIPlNumber(siplData, transaction);

    // Create SIPL
    let sipl: any = await siplRepository.createSIPL({ ...siplData, ...combinedSiplKeys }, transaction);

    sipl = sipl.get({ plain: true });

    // Create trade services for SIPL if they exist
    // --------------------
    if (Array.isArray(siplData.services) && siplData.services.length) {
      await tradeServiceService.createMultipleTradeServices(
        siplData.services,
        TRADE_SERVICE_REFERENCE_TYPES.SIPL,
        sipl.id,
        siplData.clientId,
        "purchase",
        transaction
      );
    }
    // --------------------

    let container;
    if (siplData.container) {
      container = await addContainer({ name: siplData.container }, sipl.id, siplData.clientId, transaction);
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

      const prod = await models.Product.findByPk(product.productId, { transaction }) as any;
      if (prod?.isSlabType && (product.noOfSlabs === undefined || product.noOfSlabs === null || product.noOfSlabs <= 0)) {
        throw new AppError(`Number of slabs is required for slab product "${prod.name}"`, 400);
      }

      productsWithSIPLId.push({
        ...product,
        siplId: sipl.id,
      });
    }

    await siplProductsRepository.createBulkSIPLProducts(productsWithSIPLId, transaction);

    // Create Journal entry for SIPL START.
    const siplJournalEntry = await journalEntryService.createJournalEntryForSIPL(sipl.id, siplData, transaction, locationId);
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

export const addContainer = async (containerData: Object, siplId: number, clientId: number, transaction?: Transaction) => {
  const container = await containerRepository.createContainer(
    {
      ...containerData,
      siplId,
      clientId,
    },
    transaction
  );

  return container;
};

type PackagingQuantityPayload = {
  quantity: number;
  packageLength?: number;
  packageWidth?: number;
};

export const validatePackagingQuantityNotExceedsSiplProduct = async (
  siplProduct: any,
  payload: PackagingQuantityPayload
) => {
  const maxQuantity = Number(siplProduct.quantity);
  const productName = siplProduct.requestedPurchaseProduct?.product?.name ?? "product";
  const isSlabType = siplProduct.requestedPurchaseProduct?.product?.isSlabType;

  let existingPackagingQuantity = 0;
  let newPackagingQuantity = 0;

  if (!isSlabType) {
    existingPackagingQuantity = await genericProductRepository.countBySiplProductId(siplProduct.id);
    newPackagingQuantity = Number(payload.quantity);
  } else {
    const slabs = await slabRepository.findBySiplProductId(siplProduct.id);

    // Validate slab count constraint
    const existingSlabsCount = slabs.length;
    const newSlabsCount = Number(payload.quantity);
    const totalSlabsCount = existingSlabsCount + newSlabsCount;
    const allowedSlabsCount = Number(siplProduct.noOfSlabs || 0);

    if (totalSlabsCount > allowedSlabsCount) {
      throw new AppError(
        `Total number of slabs (${totalSlabsCount}) cannot exceed the allowed number of slabs (${allowedSlabsCount}) for "${productName}".`,
        400
      );
    }

    existingPackagingQuantity = sumDecimal(slabs, "packagedSqrFt");

    const { packageLength, packageWidth, quantity } = payload;
    if (!packageLength || !packageWidth || !quantity) {
      throw new AppError("packageLength, packageWidth, and quantity are required for slab products.", 400);
    }

    const areaPerSlab = decimalDivide(decimalMultiply(packageLength, packageWidth), 144);
    newPackagingQuantity = decimalMultiply(areaPerSlab, quantity);
  }

  const totalPackagingQuantity = decimalAdd(existingPackagingQuantity, newPackagingQuantity);

  if (decimalGreaterThan(totalPackagingQuantity, maxQuantity)) {
    throw new AppError(
      `Total packaging quantity (${totalPackagingQuantity}) cannot exceed the SIPL product quantity (${maxQuantity}) for "${productName}".`,
      400
    );
  }

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

    const sellingPrice = (await productRepository.getProductByIdSimple(slabData.productId))?.singleUnitPrice;

    // Create a new InventoryProduct for each Slab with combined numbers
    const inventoryProducts: any = await inventoryProductRepository.createInventoryProductsWithCombinedNumbers(
      slabData.binId,
      slabData.quantity,
      slabData.siplId,
      true, // isSlabType = true for slabs
      sellingPrice,
      slabData.productId,
      slabData.clientId,
      transaction
    );

    const lastSerialNumber = await slabRepository.getLastSerialNumber(sipl.purchaseOrderId, slabData.siplId);
    let lastSlabNumber = await slabRepository.getLastSlabNumber(slabData.productId, slabData.siplId);

    if (slabData.slabNumber > lastSlabNumber) {
      lastSlabNumber = Number(slabData.slabNumber) - 1;
    }

    // Pair each slab with its own inventory product
    const slabs = inventoryProducts.map((inventoryProduct: any, index: number) => ({
      ...slabData, // Ensure each slab has unique data
      inventoryProductId: inventoryProduct.id,
      purchaseOrderId: sipl.purchaseOrderId,
      serialNumber: lastSerialNumber + index + 1,
      slabNumber: lastSlabNumber + index + 1,
      barcode: randomId().toUpperCase(),
    }));

    const createdSlabs = await slabRepository.createSlabs(slabs, transaction);

    await transaction.commit();
    return createdSlabs;
  } catch (error) {
    transaction.rollback();
    throw error;
  }
}

// Create generic Products for SIPL
export async function handleCreateGenericProduct(data: any) {
  const transaction = await sequelize.transaction();

  try {
    if (!data.quantity || data.quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    const sipl: any = await siplRepository.findSIPLByIdSimple(data.siplId);

    if (!sipl) {
      throw new Error("SIPL not found.");
    }

    const product = (await productRepository.getProductByIdSimple(data.productId));

    const sellingPrice = product.singleUnitPrice

    // Create a new InventoryProduct for each generic Product with combined numbers
    const inventoryProducts: any = await inventoryProductRepository.createInventoryProductsWithCombinedNumbers(
      data.binId,
      data.quantity,
      data.siplId,
      false, // isSlabType = false for generic products
      sellingPrice,
      data.productId,
      data.clientId,
      transaction
    );

    // Pair each generic Product with its own inventory product
    const genericProduct = inventoryProducts.map((inventoryProduct: any, index: number) => ({
      ...data, // Ensure each generic Product has unique data
      inventoryProductId: inventoryProduct.id,
      purchaseOrderId: sipl.purchaseOrderId,
      barcode: randomId().toUpperCase(),
    }));

    const createdGenericProduct = await genericProductRepository.createGenericProduct(genericProduct, transaction);

    await transaction.commit();
    return createdGenericProduct;
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

    const totalReceivedQuantity = sumDecimal(siplProduct.slabs, "receivedSqrFt")
    const totalPackagingQuantity = sumDecimal(siplProduct.slabs, "packagedSqrFt")
    const itemUnitCost = totalPackagingQuantity ? decimalDivide(siplProduct.totalCost, totalPackagingQuantity) : 0;

    return {
      ...siplProduct,
      totalReceivedQuantity,
      totalPackagingQuantity,
      itemUnitCost
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

  const totalPaidSiloAmount = await paymentBillRepository.getTotalPaidAmountOfBill(
    sipl.id,
    PAYMENT_BILL_REFERENCE_TYPES.SIPL
  );

  const creditNotes = await models.CreditDebitNote.findAll({
    where: {
      referenceType: CREDIT_NOTE_REFERENCE_TYPES.SIPL,
      referenceId: id
    }
  });

  sipl.creditNotes = creditNotes.map((cn: any) => cn.get({ plain: true }));

  return { ...sipl, ...calculations, totalPaidBillAmount, totalPaidSiloAmount };
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
export const getAllSIPLs = async (
  page: number,
  limit: number,
  clientId: number,
  supplierId?: number,
  inventoryReceived?: boolean,
  search?: string
) => {
  let { rows, count }: any = await siplRepository.getAllSIPLs(page, limit, clientId, supplierId, inventoryReceived, search);

  rows = await Promise.all(rows.map(async (sipl: any) => {
    sipl = sipl.get({ plain: true });

    sipl.purchaseOrder.supplier.paymentTerms = PAYMENT_TERMS.find((e) => e.id == sipl.purchaseOrder.supplier.paymentTerms);

    sipl.calculations = await getSiplCalculations(sipl.id);

    return sipl;
  }))

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

  // Calculate total trade services amount
  const totalTradeServicesAmount = sumDecimal(
    (siplData.tradeServices || []).map((ts: any) => ({
      amount: Number(ts.quantity || 0) * Number(ts.price || 0),
    })),
    "amount"
  );

  // Calculate total area of slabs that packaged.
  const totalPackagingArea = Number(
    siplData.siplProducts
      .reduce(
        (sum: number, siplProduct: any) =>
          sum + sumDecimal(siplProduct.slabs, "packagedSqrFt"),
        0
      )
  );

  // Total quantity exists in a SIPL
  const totalQuantity = sumDecimal(siplData.siplProducts, "quantity");

  // Total amount of a SIPL (products + trade services)
  const totalProductsAmount = sumDecimal(
    siplData.siplProducts.map((sp: any) => ({
      amount: sp.quantity * sp.unitPrice,
    })),
    "amount"
  );
  const totalAmount = sumDecimal([totalProductsAmount, totalTradeServicesAmount, totalBillsCharges]);

  // Calculate total area of slabs that received.
  let totalReceivingQuantity = Number(
    siplData.siplProducts
      .reduce(
        (sum: number, siplProduct: any) =>
          sum + sumDecimal(siplProduct.slabs, "receivedSqrFt"),
        0
      )
  );

  // Fetch credit notes
  const creditNotes = await models.CreditDebitNote.findAll({
    where: {
      referenceType: CREDIT_NOTE_REFERENCE_TYPES.SIPL,
      referenceId: siplId,
    },
    transaction,
  });
  const totalCreditNotesAmount = sumDecimal(creditNotes.map((cn: any) => cn.get({ plain: true })), "amount");

  // change unit bill price calcs using decimal as well.
  const unitBillPrice = decimalDivide(totalBillsCharges, totalQuantity);
  const unitServicePrice = decimalDivide(totalTradeServicesAmount, totalQuantity);
  const unitCreditNotePrice = totalQuantity > 0 ? decimalDivide(totalCreditNotesAmount, totalQuantity) : 0;

  // Calculation according to product.
  const dataAccordingToProduct = siplData.siplProducts.map((siplProduct: any) => {
    // total received area as per product.
    let totalReceivedQuantity = sumDecimal(siplProduct.slabs, "receivedSqrFt");

    if (!siplProduct.requestedPurchaseProduct.product.isSlabType) {
      totalReceivedQuantity = siplProduct.genericProducts.length;
    }

    // total packaging area as per product.
    const totalPackagingAreaPerProduct = sumDecimal(siplProduct.slabs, "packagedSqrFt");

    // Total SIPL price as per product.
    const totalSIPLProductPrice = siplProduct.quantity * siplProduct.unitPrice;

    const unitCost = siplProduct.unitPrice;

    // Total unit charge is self unit charge + bill charge per unit area.
    let landedUnitCost = decimal.decimalSum([Number(unitCost), Number(unitBillPrice), Number(unitServicePrice)]);
    landedUnitCost = Number(decimal.decimalSubtract(landedUnitCost, Number(unitCreditNotePrice)));

    let data: object = {}

    if (!siplProduct.requestedPurchaseProduct.product.isSlabType) {
      data = {
        siplProductId: siplProduct.id,
        product: {
          id: siplProduct.requestedPurchaseProduct.product.id,
          name: siplProduct.requestedPurchaseProduct.product.name,
          isSlabType: siplProduct.requestedPurchaseProduct.product.isSlabType,
        },

        totalGenericQuantity: siplProduct.genericProducts.length,

        siplProductQuantity: siplProduct.quantity,

        totalPrice: totalSIPLProductPrice,

        unitCost,
        landedUnitCost,
      };
    } else {
      data = {
        siplProductId: siplProduct.id,
        product: {
          id: siplProduct.requestedPurchaseProduct.product.id,
          name: siplProduct.requestedPurchaseProduct.product.name,
          isSlabType: siplProduct.requestedPurchaseProduct.product.isSlabType,
        },

        siplProductQuantity: siplProduct.quantity,

        totalSlabs: siplProduct.slabs.length,
        totalPrice: totalSIPLProductPrice,

        totalReceivedArea: totalReceivedQuantity,
        totalPackagingArea: totalPackagingAreaPerProduct,

        unitCost,
        landedUnitCost,
      };
    }

    return data;
  });

  const totalItemPrice = sumDecimal(dataAccordingToProduct, "totalPrice");

  return {
    dataAccordingToProduct,
    totalBillsCharges,
    totalPackagingArea,
    totalReceivingQuantity,
    totalQuantity,
    totalAmount,
    totalItemPrice,
    unitBillCharge: unitBillPrice,
    totalTradeServicesAmount,
    unitServicePrice,
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

export const getOverdueSIPLsByVendor = async (vendorId: number, clientId: number, page: number, limit: number) => {
  let { rows, count }: any = await siplRepository.getOverdueSIPLsByVendor(vendorId, clientId, page, limit);

  rows = await Promise.all(
    rows.map(async (sipl: any) => {
      sipl = sipl.get({ plain: true });
      const calculations = await getSiplCalculations(sipl.id);

      return { ...sipl, totalAmount: calculations.totalAmount };
    })
  );

  return {
    total: count,
    page,
    limit,
    data: rows,
  };
};

// Get all barcode of an SIPL
export const getAllBarcode: any = async (siplId: number) => {
  return await slabRepository.getOnlyBarcode(siplId);
};

export const getAllQrCodes: any = async (siplId: number) => {
  return await inventoryProductRepository.getQrCodesBySiplId(siplId);
};

// Get new combined slab number
export const getNewCombinedSlabNumberService = async (siplId: number) => {
  return await inventoryProductRepository.getNewCombinedNumber(siplId);
};

// Get all containers of a SIPL
export const getSIPLContainers = async (siplId: number) => {
  return await containerRepository.getContainersBySiplId(siplId);
};

export const checkSIPLDataIsFilledCorrectly = async (siplId: number) => {
  const siplRes = await siplRepository.findSIPLById(siplId);

  const sipl = siplRes?.get({ plain: true });

  let isCorrect = true;

  sipl.siplProducts.forEach((sp: any) => {

    if (!sp.requestedPurchaseProduct.product.isSlabType) {
      const totalGenericQuantity = sp.genericProducts.length;

      if (!decimal.decimalEquals(totalGenericQuantity, sp.quantity)) {
        isCorrect = false;
        throw new AppError(`Total generic quantity of product ${sp.requestedPurchaseProduct.product.name} does not match the Billed quantity.`, 400)
      }
      return;
    }

    const totalPackagingArea = decimal.decimalSum(sp.slabs.map((slab: any) => slab.packagedSqrFt ?? []))

    if (!decimal.decimalEquals(totalPackagingArea, sp.quantity)) {
      isCorrect = false;
      throw new AppError(`Packaging area of product "${sp.requestedPurchaseProduct.product.name}" does not match the Billed quantity.`, 400)
    }

  })

  return { isCorrect }
}

export const cancelSIPLService = async (siplId: number, locationId: number, clientId: number, transaction?: Transaction) => {
  const shouldCommitTransaction = !transaction;

  if (!transaction) {
    transaction = await sequelize.transaction();
  }

  try {
    const sipl = await siplRepository.findSIPLById(siplId, transaction);

    if (!sipl) {
      throw new AppError("SIPL not found", 404);
    }

    const siplData = sipl.get({ plain: true });

    if (siplData.inventoryReceived) {
      throw new AppError("Cannot cancel an SIPL that has already been received.", 400);
    }

    if (siplData.status === 'canceled') {
      throw new AppError("SIPL is already canceled.", 400);
    }

    // 1. Update SIPL status to 'canceled'
    await siplRepository.updateSIPL(siplId, { status: SIPL_STATUS.CANCELED }, transaction);

    // 2. Update all inventory products for this SIPL to 'CANCELED'
    await inventoryProductRepository.updateInventoryProductStatusBySipl(
      siplId,
      INVENTORY_ITEM_STATUS.CANCELED,
      null as any,
      transaction
    );

    // 3. Reverse journal entries
    await journalEntryService.reverseJournalEntriesForSIPL(siplId, transaction, locationId);

    if (shouldCommitTransaction) {
      await transaction.commit();
    }
    return { success: true, message: "SIPL canceled successfully" };
  } catch (error) {
    if (shouldCommitTransaction) {
      await transaction.rollback();
    }
    throw error;
  }
};