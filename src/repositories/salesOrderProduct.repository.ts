import Decimal from 'decimal.js';
import { Op, Transaction } from "sequelize";
import * as models from "../models";
import * as decimals from "../helper/decimal";
import { scoped } from "../utils/scoped";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";

export const findByIdSimple = async (id: number, transaction?: Transaction) => {
  return (await models.SalesOrderProduct.findByPk(id, { transaction }))?.get({ plain: true });
};

// Find so product with salesOrder, packagingList
export const getSOproductWithSOAndLO = async (soProductId: number) => {
  return (await models.SalesOrderProduct.findByPk(soProductId, {
    include: [
      {
        model: models.SalesOrder,
        as: "salesOrder",
      },
      {
        model: models.PackagingList,
        as: "packagingList",
      }
    ],
  }))?.get({ plain: true });
}

//  Find SalesOrderProduct by ID and salesOrderId.
export const findByInventoryProductIdAndSalesOrderId = async (
  { inventoryProductId, salesOrderId }: { inventoryProductId: number; salesOrderId: number },
  transaction?: Transaction
) => {
  return scoped(models.SalesOrderProduct).findOne({ where: { inventoryProductId, salesOrderId }, transaction });
};

// Create a new SalesOrderProduct entry.
export const createSalesOrderProduct = async (productData: any, transaction?: Transaction) => {
  return scoped(models.SalesOrderProduct).create(productData, { transaction });
};

// Update an existing SalesOrderProduct entry.
export const updateSalesOrderProduct = async (id: number, updateData: any, transaction?: Transaction) => {
  return scoped(models.SalesOrderProduct).update(updateData, {
    where: { id },
    individualHooks: true,
    transaction,
  });
};

// Get all SalesOrderProduct by salesOrderId
export const getSalesOrderProductsBySalesOrderId = async (salesOrderId: number) => {
  return await scoped(models.SalesOrderProduct).findAll({
    where: { salesOrderId },
    include: [
      {
        model: models.InventoryProduct,
        as: "inventoryProduct", // Ensures inventory product details are fetched
        include: [{ association: "slab" }]
      },
    ],
  });
};

// does all given bills belong to the given vendor
export const areSOProductsBelongingToSO = async (SOProductIds: number[], salesOrderId: number): Promise<boolean> => {
  const count = await scoped(models.SalesOrderProduct).count({
    where: {
      id: {
        [Op.in]: SOProductIds, // Get only SOProduct that match the given IDs
      },
      salesOrderId, // Ensure the salesOrderId matches
    },
  });

  return count === SOProductIds.length; // If count matches the number of IDs, all belong to salesOrder
};

// update hold status of slab
export const updatePickedStatus = async (id: number, picked: boolean) => {
  return await scoped(models.SalesOrderProduct).update({ picked }, { where: { id } });
};

// Delete a SalesOrderProduct by ID
export const deleteSalesOrderProduct = async (id: number, transaction?: Transaction) => {
  return await scoped(models.SalesOrderProduct).destroy({
    where: { id },
    transaction,
  });
};

export const getTotalsOfSalesOrderProducts = (salesOrderProducts: any[], discountPercentage: number = 0, taxPercentage: number = -1) => {
  if (taxPercentage === -1) {
    taxPercentage = salesOrderProducts.length > 0 ? (Number(salesOrderProducts[0].taxPercentage) || 0) : 0;
  }
  const calcs = {
    soReceiving: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0, productDiscountAmount: 0, lineDiscountAmount: 0 },
    receiving: { total: 0 },
    packagingList: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0, productDiscountAmount: 0, lineDiscountAmount: 0 },
    loadingOrder: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0, productDiscountAmount: 0, lineDiscountAmount: 0 },
    final: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0, productDiscountAmount: 0, lineDiscountAmount: 0 },
    quantities: { receiving: 0, packagingList: 0, loadingOrder: 0, final: 0 }
  };

  const soDiscountBuckets = new Map<number, number>();
  const plDiscountBuckets = new Map<number, number>();
  const loDiscountBuckets = new Map<number, number>();
  const finalDiscountBuckets = new Map<number, number>();

  for (const salesOrderProduct of salesOrderProducts) {
    const pInlineDiscount = Number(salesOrderProduct.discountPercentage) || 0;
    const pLineDiscount = Number(salesOrderProduct.lineDiscountPercentage) || 0;
    const pSoDiscount =
      salesOrderProduct.soDiscountPercentage !== undefined && salesOrderProduct.soDiscountPercentage !== null
        ? Number(salesOrderProduct.soDiscountPercentage) || 0
        : Number(discountPercentage) || 0;

    // Order of discounts: product (inline) discount -> requirement line discount -> SO discount.
    const addProductDiscounts = (
      stage: { inlineDiscountAmount: number; productDiscountAmount: number; lineDiscountAmount: number },
      baseAmount: number,
      buckets: Map<number, number>
    ) => {
      const productDiscount = decimals.decimalValueByPercentage(baseAmount, pInlineDiscount, 2);
      const afterProduct = decimals.decimalSubtractDP(baseAmount, productDiscount, 2);
      const lineDiscount = decimals.decimalValueByPercentage(afterProduct, pLineDiscount, 2);
      const inlineTotal = decimals.decimalAddDP(productDiscount, lineDiscount, 2);
      const afterInline = decimals.decimalSubtractDP(baseAmount, inlineTotal, 2);
      stage.productDiscountAmount = decimals.decimalAddDP(stage.productDiscountAmount, productDiscount, 2);
      stage.lineDiscountAmount = decimals.decimalAddDP(stage.lineDiscountAmount, lineDiscount, 2);
      stage.inlineDiscountAmount = decimals.decimalAddDP(stage.inlineDiscountAmount, inlineTotal, 2);
      if (pSoDiscount > 0 && afterInline > 0) {
        buckets.set(pSoDiscount, decimals.decimalAddDP(buckets.get(pSoDiscount) || 0, afterInline, 2));
      }
    };

    const amt = Number(salesOrderProduct.amount) || 0;
    calcs.soReceiving.subTotal = decimals.decimalAddDP(calcs.soReceiving.subTotal, amt, 2);
    addProductDiscounts(calcs.soReceiving, amt, soDiscountBuckets);

    calcs.receiving.total = decimals.decimalAddDP(calcs.receiving.total, Number(salesOrderProduct.inventoryProduct?.assetValue) || 0, 2);

    const plAmt = Number(salesOrderProduct.plAmount) || 0;
    calcs.packagingList.subTotal = decimals.decimalAddDP(calcs.packagingList.subTotal, plAmt, 2);
    addProductDiscounts(calcs.packagingList, plAmt, plDiscountBuckets);

    const loAmt = Number(salesOrderProduct.loAmount) || 0;
    calcs.loadingOrder.subTotal = decimals.decimalAddDP(calcs.loadingOrder.subTotal, loAmt, 2);
    addProductDiscounts(calcs.loadingOrder, loAmt, loDiscountBuckets);

    // Active stage amount for final composite (prefers LO if assigned, otherwise PL, otherwise SO receiving)
    let activeAmt = 0;
    if (salesOrderProduct.loadingOrderId && loAmt > 0) {
      activeAmt = loAmt;
    } else if (plAmt > 0) {
      activeAmt = plAmt;
    } else {
      activeAmt = amt;
    }
    calcs.final.subTotal = decimals.decimalAddDP(calcs.final.subTotal, activeAmt, 2);
    addProductDiscounts(calcs.final, activeAmt, finalDiscountBuckets);

    if (salesOrderProduct.isSlabType) {
      calcs.quantities.receiving = decimals.decimalAddDP(calcs.quantities.receiving, Number(salesOrderProduct.receivingAreaSqFt) || 0, 2);
      calcs.quantities.packagingList = decimals.decimalAddDP(calcs.quantities.packagingList, Number(salesOrderProduct.plSqrFt) || 0, 2);
      calcs.quantities.loadingOrder = decimals.decimalAddDP(calcs.quantities.loadingOrder, Number(salesOrderProduct.loSqrFt) || 0, 2);
      const activeQty = (salesOrderProduct.loadingOrderId && Number(salesOrderProduct.loSqrFt) > 0)
        ? Number(salesOrderProduct.loSqrFt) || 0
        : (Number(salesOrderProduct.plSqrFt) || Number(salesOrderProduct.receivingAreaSqFt) || 0);
      calcs.quantities.final = decimals.decimalAddDP(calcs.quantities.final, activeQty, 2);
    } else {
      calcs.quantities.receiving = decimals.decimalAddDP(calcs.quantities.receiving, 1, 2);
      if (salesOrderProduct.loAmount) {
        calcs.quantities.loadingOrder = decimals.decimalAddDP(calcs.quantities.loadingOrder, 1, 2);
      }
      if (salesOrderProduct.plAmount) {
        calcs.quantities.packagingList = decimals.decimalAddDP(calcs.quantities.packagingList, 1, 2);
      }
      calcs.quantities.final = decimals.decimalAddDP(calcs.quantities.final, 1, 2);
    }
  }

  // --- Calculate Discounts ---
  const sumBucketDiscounts = (buckets: Map<number, number>) => {
    let totalDiscount = 0;
    for (const [discPct, afterInlineSum] of buckets.entries()) {
      const discAmt = decimals.decimalValueByPercentage(afterInlineSum, discPct, 2);
      totalDiscount = decimals.decimalAddDP(totalDiscount, discAmt, 2);
    }
    return totalDiscount;
  };

  calcs.soReceiving.discountAmount = sumBucketDiscounts(soDiscountBuckets);
  calcs.packagingList.discountAmount = sumBucketDiscounts(plDiscountBuckets);
  calcs.loadingOrder.discountAmount = sumBucketDiscounts(loDiscountBuckets);
  calcs.final.discountAmount = sumBucketDiscounts(finalDiscountBuckets);

  // --- Calculate Taxes ---
  let soAmountAfterDiscount = decimals.decimalSubtractDP(decimals.decimalSubtractDP(calcs.soReceiving.subTotal, calcs.soReceiving.inlineDiscountAmount, 2), calcs.soReceiving.discountAmount, 2);
  calcs.soReceiving.taxable = soAmountAfterDiscount;
  calcs.soReceiving.tax = decimals.decimalValueByPercentage(soAmountAfterDiscount, taxPercentage, 2);

  let plAmountAfterDiscount = decimals.decimalSubtractDP(decimals.decimalSubtractDP(calcs.packagingList.subTotal, calcs.packagingList.inlineDiscountAmount, 2), calcs.packagingList.discountAmount, 2);
  calcs.packagingList.taxable = plAmountAfterDiscount;
  calcs.packagingList.tax = decimals.decimalValueByPercentage(plAmountAfterDiscount, taxPercentage, 2);

  let loAmountAfterDiscount = decimals.decimalSubtractDP(decimals.decimalSubtractDP(calcs.loadingOrder.subTotal, calcs.loadingOrder.inlineDiscountAmount, 2), calcs.loadingOrder.discountAmount, 2);
  calcs.loadingOrder.taxable = loAmountAfterDiscount;
  calcs.loadingOrder.tax = decimals.decimalValueByPercentage(loAmountAfterDiscount, taxPercentage, 2);

  let finalAmountAfterDiscount = decimals.decimalSubtractDP(decimals.decimalSubtractDP(calcs.final.subTotal, calcs.final.inlineDiscountAmount, 2), calcs.final.discountAmount, 2);
  calcs.final.taxable = finalAmountAfterDiscount;
  calcs.final.tax = decimals.decimalValueByPercentage(finalAmountAfterDiscount, taxPercentage, 2);

  // --- Calculate Totals ---
  calcs.soReceiving.total = decimals.decimalAddDP(soAmountAfterDiscount, calcs.soReceiving.tax, 2);
  calcs.packagingList.total = decimals.decimalAddDP(plAmountAfterDiscount, calcs.packagingList.tax, 2);
  calcs.loadingOrder.total = decimals.decimalAddDP(loAmountAfterDiscount, calcs.loadingOrder.tax, 2);
  calcs.final.total = decimals.decimalAddDP(finalAmountAfterDiscount, calcs.final.tax, 2);

  // Fallback if no products had amounts
  if (calcs.final.subTotal === 0 && calcs.final.total === 0) {
    calcs.final.total = calcs.receiving.total;
  }

  return calcs;
}

export const getInvoicedProductsForRevenue = async (clientId: number) => {
  return await scoped(models.SalesOrderProduct.unscoped()).findAll({
    where: {
      clientId,
      stage: SALE_ORDER_PRODUCT_STAGES.INVOICED
    },
    include: [
      {
        model: models.InventoryProduct,
        as: "inventoryProduct",
        include: [
          {
            model: models.Slab,
            as: "slab",
            attributes: ["id", "receivingLength", "receivingWidth", "receivedSqrFt"]
          }
        ]
      }
    ]
  });
};

export const getSalesOrderProductsByPackagingListId = async (packagingListId: number, transaction?: Transaction) => {
  return await scoped(models.SalesOrderProduct).findAll({
    where: { packagingListId },
    transaction
  });
};

export const updateSalesOrderProductsByPackagingListId = async (
  packagingListId: number,
  updateData: any,
  transaction?: Transaction
) => {
  return await scoped(models.SalesOrderProduct).update(updateData, {
    where: { packagingListId },
    transaction
  });
};