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

export const getTotalsOfSalesOrderProducts = (salesOrderProducts: any[]) => {
  const calcs = {
    soReceiving: {
      subTotal: 0, // total of each "amount"
      taxable: 0, // total of each "amount" with taxApplied = true
      tax: 0, // taxAmount
      total: 0, // subTotal + tax
    },
    receiving: {
      total: 0, // subTotal + tax
    },
    packagingList: {
      subTotal: 0, // total of each "plAmount"
      taxable: 0, // total of each "plAmount" with taxApplied = true
      tax: 0, // plTaxAmount
      total: 0, // subTotal + tax
    },
    loadingOrder: {
      subTotal: 0, // total of each "loAmount"
      taxable: 0, // total of each "loAmount" with taxApplied = true
      tax: 0, // loTaxAmount
      total: 0, // subTotal + tax
    },
    final: {
      subTotal: 0, // total of each "loAmount"
      taxable: 0, // total of each "loAmount" with taxApplied = true
      tax: 0, // loTaxAmount
      total: 0, // subTotal + tax
    },
    quantities: {
      receiving: 0,
      packagingList: 0,
      loadingOrder: 0,
      final: 0,
    }
  }

  for (const salesOrderProduct of salesOrderProducts) {

    // SO amounts as per receiving dimensions -----
    calcs.soReceiving.subTotal = decimals.decimalAdd(calcs.soReceiving.subTotal, Number(salesOrderProduct.amount) || 0);

    if (salesOrderProduct.taxApplied) {
      calcs.soReceiving.taxable = decimals.decimalAdd(calcs.soReceiving.taxable, Number(salesOrderProduct.amount) || 0);
    }

    calcs.soReceiving.tax = decimals.decimalAdd(calcs.soReceiving.tax, Number(salesOrderProduct.taxAmount) || 0);

    // Calculate for receiving ------
    calcs.receiving.total = decimals.decimalAdd(calcs.receiving.total, Number(salesOrderProduct.inventoryProduct.assetValue) || 0);

    // Calculate for packaging list
    calcs.packagingList.subTotal = decimals.decimalAdd(calcs.packagingList.subTotal, Number(salesOrderProduct.plAmount) || 0);
    if (salesOrderProduct.taxApplied) {
      calcs.packagingList.taxable = decimals.decimalAdd(calcs.packagingList.taxable, Number(salesOrderProduct.plAmount) || 0);
    }

    calcs.packagingList.tax = decimals.decimalAdd(calcs.packagingList.tax, Number(salesOrderProduct.plTaxAmount) || 0);

    // Calculate for loading order
    calcs.loadingOrder.subTotal = decimals.decimalAdd(calcs.loadingOrder.subTotal, Number(salesOrderProduct.loAmount) || 0);
    if (salesOrderProduct.taxApplied) {
      calcs.loadingOrder.taxable = decimals.decimalAdd(calcs.loadingOrder.taxable, Number(salesOrderProduct.loAmount) || 0);
    }

    if (salesOrderProduct.isSlabType) {
      calcs.quantities.receiving = decimals.decimalAdd(calcs.quantities.receiving, Number(salesOrderProduct.receivingAreaSqFt) || 0);

      calcs.quantities.packagingList = decimals.decimalAdd(calcs.quantities.packagingList, salesOrderProduct.plSqrFt);

      calcs.quantities.loadingOrder = decimals.decimalAdd(calcs.quantities.loadingOrder, salesOrderProduct.loSqrFt);
    } else {
      calcs.quantities.receiving = decimals.decimalAdd(calcs.quantities.receiving, 1);

      // if loAmount exists that means it is in loading order
      if (salesOrderProduct.loAmount) {
        calcs.quantities.loadingOrder = decimals.decimalAdd(calcs.quantities.loadingOrder, 1);
      }

      // if plAmount exists that means it is in packaging list
      if (salesOrderProduct.plAmount) {
        calcs.quantities.packagingList = decimals.decimalAdd(calcs.quantities.packagingList, 1);
      }

    }

    calcs.loadingOrder.tax = decimals.decimalAdd(calcs.loadingOrder.tax, Number(salesOrderProduct.loTaxAmount) || 0);
  }

  calcs.soReceiving.total = decimals.decimalAdd(calcs.soReceiving.subTotal, calcs.soReceiving.tax);
  calcs.packagingList.total = decimals.decimalAdd(calcs.packagingList.subTotal, calcs.packagingList.tax);
  calcs.loadingOrder.total = decimals.decimalAdd(calcs.loadingOrder.subTotal, calcs.loadingOrder.tax);

  if (calcs.loadingOrder.total) {
    calcs.final = calcs.loadingOrder;
    calcs.quantities.final = calcs.quantities.loadingOrder
  } else if (calcs.packagingList.total) {
    calcs.final = calcs.packagingList;
    calcs.quantities.final = calcs.quantities.packagingList
  } else {
    calcs.final.total = calcs.receiving.total;
    calcs.quantities.final = calcs.quantities.receiving
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