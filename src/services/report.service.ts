import _ from "lodash";
import * as reportRepository from "../repositories/report.repository";
import { INVENTORY_ITEM_STATUS, PAYMENT_TERMS } from "../constants";

export const getInventorySummaryReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getInventorySummary(clientId, page, limit, locationId);

  // Format the response
  const formattedProducts = data.products.map((product: any) => {
    let availableSlabs = 0;
    let availableArea = 0;
    let heldSlabs = 0;
    let heldArea = 0;
    let allocatedSlabs = 0;
    let allocatedArea = 0;
    let totalLandedCost = 0;
    let countWithCost = 0;

    let primaryLocation = "-";
    const locations = new Set<string>();

    const inventoryItems = product.inventoryProducts || [];

    for (const item of inventoryItems) {
      if (item.location?.locationName) {
        locations.add(item.location.locationName);
      }

      const sqft = item.slab
        ? _.round(((Number(item.slab.receivingLength) || 0) * (Number(item.slab.receivingWidth) || 0)) / 144, 2)
        : 0;

      const isHold = !!item.holdItem || !!(item.genericProduct && item.genericProduct.isHold);

      if (isHold) {
        heldSlabs += 1;
        heldArea += sqft;
      } else if (item.status === INVENTORY_ITEM_STATUS.IN_INVENTORY) {
        availableSlabs += 1;
        availableArea += sqft;
      } else if (item.status === INVENTORY_ITEM_STATUS.ALLOCATED) {
        allocatedSlabs += 1;
        allocatedArea += sqft;
      }
      
      // We don't usually include SOLD in current inventory summary unless explicitly asked,
      // but total slabs = available + hold + allocated

      if (item.landedUnitCost) {
        totalLandedCost += Number(item.landedUnitCost);
        countWithCost += 1;
      }
    }

    if (locations.size === 1) {
      primaryLocation = Array.from(locations)[0];
    } else if (locations.size > 1) {
      primaryLocation = "Multiple";
    }

    const totalSlabs = availableSlabs + heldSlabs + allocatedSlabs;
    const totalArea = _.round(availableArea + heldArea + allocatedArea, 2);

    const avgLandedCostPerSF = countWithCost > 0 ? _.round(totalLandedCost / countWithCost, 2) : 0;
    const inventoryValue = _.round(totalArea * avgLandedCostPerSF, 2);

    return {
      id: product.id,
      productName: product.name,
      category: product.subCategory?.name || "-",
      material: product.group?.name || "-",
      color: product.baseColor?.name || "-",
      finish: product.finish?.name || "-",
      thickness: product.thickness || "-",
      location: primaryLocation,
      totalSlabs,
      totalSF: totalArea,
      availableSlabs,
      availableSF: _.round(availableArea, 2),
      heldSlabs,
      heldSF: _.round(heldArea, 2),
      avgLandedCostPerSF,
      inventoryValue,
    };
  });

  return {
    products: formattedProducts,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getSlabInventoryDetail = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getSlabInventoryDetail(clientId, page, limit, locationId);

  const formattedSlabs = data.slabs.map((item: any) => {
    const product = item.product || {};
    const slab = item.slab || {};
    
    // SF Calculation
    const length = Number(slab.receivingLength) || 0;
    const width = Number(slab.receivingWidth) || 0;
    const sqft = _.round((length * width) / 144, 2);

    // Calculate Age (Days)
    const receivedDate = item.receivedDate || item.createdAt;
    const ageDays = receivedDate 
      ? Math.floor((new Date().getTime() - new Date(receivedDate).getTime()) / (1000 * 3600 * 24))
      : 0;

    // Costs & Prices
    const avgLandedCost = Number(item.landedUnitCost) || 0;
    const slabLandedCost = _.round(avgLandedCost * sqft, 2);
    const sellingPrice = Number(item.sellingPrice) || Number(product.singleUnitPrice) || 0;

    // Hold info
    const holdItem = item.holdItem?.hold || {};
    const holdCustomer = holdItem.customer?.name || "-";
    const holdId = holdItem.id || "-";
    const isHold = !!item.holdItem || !!(item.genericProduct && item.genericProduct.isHold);
    
    let displayStatus = item.status;
    if (isHold) {
      displayStatus = "Hold";
    }

    return {
      id: item.id,
      slabNo: slab.slabNumber || slab.serialNumber || "-",
      productName: product.name || "-",
      category: product.subCategory?.name || "-",
      material: product.group?.name || "-",
      color: product.baseColor?.name || "-",
      finish: product.finish?.name || "-",
      thickness: product.thickness || "-",
      lotSipl: slab.lot || item.sipl?.invoiceCode || "-",
      bundleNo: slab.block || "-",
      location: item.location?.locationName || "-",
      length,
      width,
      sqft,
      status: displayStatus,
      receivedDate,
      ageDays,
      avgLandedCostPerSF: _.round(avgLandedCost, 2),
      slabLandedCost,
      sellingPricePerSF: _.round(sellingPrice, 2),
      holdNo: holdId,
      holdCustomer
    };
  });

  return {
    slabs: formattedSlabs,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getInventoryAgingReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getSlabInventoryDetail(clientId, page, limit, locationId);

  const formattedSlabs = data.slabs.map((item: any) => {
    const product = item.product || {};
    const slab = item.slab || {};
    
    // SF Calculation
    const length = Number(slab.receivingLength) || 0;
    const width = Number(slab.receivingWidth) || 0;
    const sqft = _.round((length * width) / 144, 2);

    // Calculate Age (Days)
    const receivedDate = item.receivedDate || item.createdAt;
    const ageDays = receivedDate 
      ? Math.floor((new Date().getTime() - new Date(receivedDate).getTime()) / (1000 * 3600 * 24))
      : 0;
      
    // Ageing Bucket
    let ageingBucket = "";
    if (ageDays <= 30) ageingBucket = "0-30 Days";
    else if (ageDays <= 60) ageingBucket = "31-60 Days";
    else if (ageDays <= 90) ageingBucket = "61-90 Days";
    else if (ageDays <= 120) ageingBucket = "91-120 Days";
    else ageingBucket = "120+ Days";

    // Costs
    const landedCostPerSF = Number(item.landedUnitCost) || 0;
    const inventoryValue = _.round(landedCostPerSF * sqft, 2);

    // Status
    const isHold = !!item.holdItem || !!(item.genericProduct && item.genericProduct.isHold);
    let displayStatus = item.status;
    if (isHold) {
      displayStatus = "Hold";
    }

    return {
      id: item.id,
      productName: product.name || "-",
      bundleNo: slab.block || "-",
      slabNo: slab.slabNumber || slab.serialNumber || "-",
      location: item.location?.locationName || "-",
      receivedDate,
      ageDays,
      ageingBucket,
      sqft,
      status: displayStatus,
      landedCostPerSF: _.round(landedCostPerSF, 2),
      inventoryValue,
    };
  });

  return {
    slabs: formattedSlabs,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getInventoryValuationReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getInventorySummary(clientId, page, limit, locationId);

  const formattedProducts = data.products.map((product: any) => {
    let totalSlabs = 0;
    let totalArea = 0;
    let totalLandedCost = 0;
    let countWithCost = 0;
    
    let lastLandedCost = 0;
    let latestDate = 0;

    let primaryLocation = "-";
    const locations = new Set<string>();

    const inventoryItems = product.inventoryProducts || [];

    for (const item of inventoryItems) {
      if (item.location?.locationName) {
        locations.add(item.location.locationName);
      }

      const sqft = item.slab
        ? _.round(((Number(item.slab.receivingLength) || 0) * (Number(item.slab.receivingWidth) || 0)) / 144, 2)
        : 0;
        
      totalSlabs += 1;
      totalArea += sqft;

      if (item.landedUnitCost) {
        totalLandedCost += Number(item.landedUnitCost);
        countWithCost += 1;
        
        const itemDate = item.receivedDate ? new Date(item.receivedDate).getTime() : new Date(item.createdAt).getTime();
        if (itemDate > latestDate) {
          latestDate = itemDate;
          lastLandedCost = Number(item.landedUnitCost);
        }
      }
    }

    if (locations.size === 1) {
      primaryLocation = Array.from(locations)[0];
    } else if (locations.size > 1) {
      primaryLocation = "Multiple";
    }

    totalArea = _.round(totalArea, 2);
    const avgLandedCostPerSF = countWithCost > 0 ? _.round(totalLandedCost / countWithCost, 2) : 0;
    const inventoryValue = _.round(totalArea * avgLandedCostPerSF, 2);

    return {
      id: product.id,
      productName: product.name,
      category: product.subCategory?.name || "-",
      material: product.group?.name || "-",
      finish: product.finish?.name || "-",
      thickness: product.thickness || "-",
      location: primaryLocation,
      totalSlabs,
      totalSF: totalArea,
      avgLandedCostPerSF,
      lastLandedCostPerSF: _.round(lastLandedCost, 2),
      inventoryValue,
    };
  });

  return {
    products: formattedProducts,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getHeldInventoryReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getHeldInventoryReport(clientId, page, limit, locationId);

  const formattedItems = data.heldItems.map((item: any) => {
    const hold = item.hold || {};
    const inventoryProduct = item.inventoryProduct || {};
    const product = inventoryProduct.product || {};
    const slab = inventoryProduct.slab || {};
    
    // Dates
    const holdDate = hold.createdAt;
    const holdUntil = hold.expiresAt;
    const holdDays = holdDate 
      ? Math.floor((new Date().getTime() - new Date(holdDate).getTime()) / (1000 * 3600 * 24))
      : 0;

    // SF Calculation
    const length = Number(slab.receivingLength) || 0;
    const width = Number(slab.receivingWidth) || 0;
    const sqft = _.round((length * width) / 144, 2);

    // Value
    const sellingPricePerSF = Number(item.price) || Number(inventoryProduct.sellingPrice) || 0;
    const value = _.round(sellingPricePerSF * sqft, 2);

    return {
      id: item.id,
      holdNo: hold.clientHoldNumber || hold.id || '-',
      holdDate,
      holdUntil,
      holdDays,
      customerName: hold.customer?.name || '-',
      salesperson: hold.createdBy?.name || '-',
      productName: product.name || '-',
      bundleNo: slab.block || '-',
      slabNo: slab.slabNumber || slab.serialNumber || '-',
      sqft,
      location: inventoryProduct.location?.locationName || '-',
      sellingPricePerSF: _.round(sellingPricePerSF, 2),
      value,
      holdStatus: hold.stage || '-',
    };
  });

  return {
    heldItems: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getSalesOrderRegisterReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getSalesOrderRegisterReport(clientId, page, limit, locationId);

  const formattedItems = data.salesOrders.map((so: any) => {
    let orderSF = 0;
    let subtotal = 0;
    let taxAmount = 0;
    let landedCost = 0;
    let fulfilledCount = 0;

    const products = so.salesOrderProducts || [];
    
    for (const p of products) {
      const sqft = Number(p.receivingAreaSqFt) || 0;
      orderSF += sqft;
      
      const amount = Number(p.amount) || 0;
      const tAmount = Number(p.taxAmount) || 0;
      
      subtotal += amount;
      taxAmount += tAmount;
      
      const unitCost = p.inventoryProduct ? Number(p.inventoryProduct.landedUnitCost) || 0 : 0;
      landedCost += unitCost * sqft;
      
      if (p.stage === 'Packaging List' || p.stage === 'Invoiced' || p.picked) {
        fulfilledCount++;
      }
    }

    const totalAmount = subtotal + taxAmount;
    const grossProfit = subtotal - landedCost;
    const margin = subtotal > 0 ? (grossProfit / subtotal) * 100 : 0;
    const fulfilmentPercent = products.length > 0 ? (fulfilledCount / products.length) * 100 : 0;

    return {
      id: so.id,
      soNo: so.clientSoNumber || so.id || '-',
      soDate: so.soDate,
      opportunityNo: so.quotation?.opportunity?.clientOpportunityNumber || '-',
      customerName: so.customer?.name || '-',
      salesperson: so.createdBy?.name || '-',
      saleLocation: so.soLocation?.locationName || '-',
      customerPo: so.customerPo || '-',
      type: so.deliveryType || '-',
      tax: so.tax ? so.tax.code : '-',
      orderSF: _.round(orderSF, 2),
      subtotal: _.round(subtotal, 2),
      taxAmount: _.round(taxAmount, 2),
      totalAmount: _.round(totalAmount, 2),
      landedCost: _.round(landedCost, 2),
      grossProfit: _.round(grossProfit, 2),
      marginPercent: _.round(margin, 2),
      fulfilmentPercent: _.round(fulfilmentPercent, 2),
      status: so.status || '-',
    };
  });

  return {
    salesOrders: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getSlabSalesDetailReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getSlabSalesDetailReport(clientId, page, limit, locationId);

  const formattedItems = data.salesProducts.map((p: any) => {
    const so = p.salesOrder || {};
    const ip = p.inventoryProduct || {};
    const product = ip.product || {};
    const slab = ip.slab || {};
    const location = p.location || {};

    const invoice = (so.salesOrderInvoices && so.salesOrderInvoices.length > 0) 
      ? so.salesOrderInvoices[0] 
      : null;
    const invoiceNo = invoice ? (invoice.clientSoInvoiceNumber || invoice.invoiceCode) : '-';

    const sfSold = Number(p.receivingAreaSqFt) || 0; // or finalSqrFt if that's more accurate for sales amount, wait amount is based on receivingAreaSqFt for SO phase.
    const sellPricePerSF = Number(p.unitPrice) || 0;
    const salesAmount = Number(p.amount) || 0;
    const landedCostPerSF = Number(ip.landedUnitCost) || 0;
    const landedCost = _.round(landedCostPerSF * sfSold, 2);
    const grossProfit = _.round(salesAmount - landedCost, 2);
    const margin = salesAmount > 0 ? (grossProfit / salesAmount) * 100 : 0;

    return {
      id: p.id,
      soNo: so.clientSoNumber || so.id || '-',
      invoiceNo,
      saleDate: so.soDate,
      customerName: so.customer?.name || '-',
      salesperson: so.createdBy?.name || '-',
      productName: product.name || '-',
      bundleNo: slab.block || '-',
      slabNo: slab.slabNumber || slab.serialNumber || '-',
      sfSold: _.round(sfSold, 2),
      sellPricePerSF: _.round(sellPricePerSF, 2),
      salesAmount: _.round(salesAmount, 2),
      landedCostPerSF: _.round(landedCostPerSF, 2),
      landedCost,
      grossProfit,
      marginPercent: _.round(margin, 2),
      location: location.locationName || '-',
    };
  });

  return {
    salesProducts: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getSalesByCustomerReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getSalesByCustomerReport(clientId, page, limit, locationId);

  const formattedItems = data.customers.map((c: any) => {
    let ordersCount = 0;
    let slabsSold = 0;
    let totalSF = 0;
    let grossSales = 0;
    let discounts = 0; // Currently no discounts field in SO
    let landedCost = 0;
    let lastSaleDate: any = null;

    const salesOrders = c.salesOrders || [];
    ordersCount = salesOrders.length;

    for (const so of salesOrders) {
      if (!lastSaleDate || new Date(so.soDate) > new Date(lastSaleDate)) {
        lastSaleDate = so.soDate;
      }
      
      const products = so.salesOrderProducts || [];
      for (const p of products) {
        if (p.isSlabType) {
          slabsSold++;
        }
        
        const sf = Number(p.receivingAreaSqFt) || 0;
        totalSF += sf;
        
        grossSales += Number(p.amount) || 0;
        
        const unitCost = p.inventoryProduct ? Number(p.inventoryProduct.landedUnitCost) || 0 : 0;
        landedCost += unitCost * sf;
      }
    }

    const netSales = grossSales - discounts;
    const grossProfit = netSales - landedCost;
    const margin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;
    const avgSellingPrice = totalSF > 0 ? (netSales / totalSF) : 0;

    return {
      id: c.id,
      customerName: c.name || '-',
      customerType: c.type || '-',
      ordersCount,
      slabsSold,
      totalSF: _.round(totalSF, 2),
      grossSales: _.round(grossSales, 2),
      discounts: _.round(discounts, 2),
      netSales: _.round(netSales, 2),
      landedCost: _.round(landedCost, 2),
      grossProfit: _.round(grossProfit, 2),
      marginPercent: _.round(margin, 2),
      avgSellingPrice: _.round(avgSellingPrice, 2),
      lastSaleDate: lastSaleDate || '-',
    };
  });

  return {
    customers: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getSalesByProductReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getSalesByProductReport(clientId, page, limit, locationId);

  const formattedItems = data.products.map((product: any) => {
    let slabsSold = 0;
    let totalSF = 0;
    let grossSales = 0;
    let totalLandedCost = 0;

    const inventoryProducts = product.inventoryProducts || [];

    for (const ip of inventoryProducts) {
      const landedUnitCost = Number(ip.landedUnitCost) || 0;
      const salesProducts = ip.salesOrderProducts || [];
      
      for (const sp of salesProducts) {
        if (sp.isSlabType) {
          slabsSold++;
        }
        
        const sf = Number(sp.receivingAreaSqFt) || 0;
        totalSF += sf;
        
        grossSales += Number(sp.amount) || 0;
        totalLandedCost += landedUnitCost * sf;
      }
    }

    const netSales = grossSales; // No discount field available yet
    const grossProfit = netSales - totalLandedCost;
    const margin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;
    const avgSellingPrice = totalSF > 0 ? (netSales / totalSF) : 0;
    const avgLandedCost = totalSF > 0 ? (totalLandedCost / totalSF) : 0;

    return {
      id: product.id,
      productName: product.name || '-',
      category: product.subCategory?.name || '-',
      material: product.group?.name || '-',
      color: product.baseColor?.name || '-',
      finish: product.finish?.name || '-',
      thickness: product.thickness || '-',
      slabsSold,
      totalSF: _.round(totalSF, 2),
      grossSales: _.round(grossSales, 2),
      netSales: _.round(netSales, 2),
      avgSellingPrice: _.round(avgSellingPrice, 2),
      avgLandedCost: _.round(avgLandedCost, 2),
      grossProfit: _.round(grossProfit, 2),
      marginPercent: _.round(margin, 2),
    };
  });

  return {
    products: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getSalesProfitabilityReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getSalesProfitabilityReport(clientId, page, limit, locationId);

  const formattedItems = data.salesProducts.map((p: any) => {
    const so = p.salesOrder || {};
    const ip = p.inventoryProduct || {};
    const product = ip.product || {};
    const location = p.location || {};

    const invoice = (so.salesOrderInvoices && so.salesOrderInvoices.length > 0) 
      ? so.salesOrderInvoices[0] 
      : null;
    const invoiceNo = invoice ? (invoice.clientSoInvoiceNumber || invoice.invoiceCode) : '-';

    const sfSold = p.isSlabType ? (Number(p.receivingAreaSqFt) || 0) : 0;
    
    const salesAmount = Number(p.amount) || 0;
    const landedCostPerSF = Number(ip.landedUnitCost) || 0;
    // For non-slabs, landedCost might be calculated by qty, but let's assume landedCost is landedCostPerSF * sfSold for slabs, and landedCostPerSF * qty for non-slabs.
    // Wait, receivingAreaSqFt is area for slabs, and qty for non-slabs? No, non-slabs might not have receivingAreaSqFt. 
    // Let's just use receivingAreaSqFt for both, if they don't have it, it'll be 0. Or wait, amount handles it internally.
    const qtyOrSf = p.isSlabType ? sfSold : (Number(p.receivingAreaSqFt) || 1); // If it's 0, default to 1 for non-slabs? Wait, better to just use sfSold for landedCost if it's a slab.
    const landedCost = p.isSlabType ? _.round(landedCostPerSF * sfSold, 2) : _.round(landedCostPerSF, 2); 
    
    const grossProfit = _.round(salesAmount - landedCost, 2);
    const margin = salesAmount > 0 ? (grossProfit / salesAmount) * 100 : 0;

    return {
      id: p.id,
      soNo: so.clientSoNumber || so.id || '-',
      invoiceNo,
      saleDate: so.soDate,
      customerName: so.customer?.name || '-',
      salesperson: so.createdBy?.name || '-',
      productName: product.name || '-',
      sfSold: _.round(sfSold, 2),
      salesAmount: _.round(salesAmount, 2),
      landedCost,
      grossProfit,
      marginPercent: _.round(margin, 2),
      saleLocation: location.locationName || '-',
    };
  });

  return {
    salesProducts: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getPurchaseOrderRegisterReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getPurchaseOrderRegisterReport(clientId, page, limit, locationId);

  const formattedItems = data.purchaseOrders.map((po: any) => {
    let orderedUnits = 0;
    let orderedSF = 0; // PO doesn't have Ordered SF tracked explicitly, but we'll try to extract it or set 0
    let subtotal = 0;
    const productsSet = new Set<string>();

    const requestedProducts = po.requestedPurchaseProducts || [];
    for (const rp of requestedProducts) {
      const qty = Number(rp.quantity) || 0;
      orderedUnits += qty;
      subtotal += qty * (Number(rp.unitPrice) || 0);
      
      if (rp.product?.name) {
        productsSet.add(rp.product.name);
      }
    }

    let receivedUnits = 0;
    let receivedSF = 0;

    const sipls = po.sipls || [];
    for (const sipl of sipls) {
      if (sipl.inventoryReceived) {
        const siplProducts = sipl.siplProducts || [];
        for (const sp of siplProducts) {
          receivedUnits += Number(sp.quantity) || 0;
          
          const slabs = sp.slabs || [];
          for (const slab of slabs) {
            const length = Number(slab.receivingLength) || 0;
            const width = Number(slab.receivingWidth) || 0;
            receivedSF += (length * width) / 144;
          }
        }
      }
    }

    const freight = 0; // Not currently extracted from PO directly
    const tax = 0;
    const totalPOValue = subtotal + freight + tax;
    
    const receiptPercent = orderedUnits > 0 ? (receivedUnits / orderedUnits) * 100 : 0;

    return {
      id: po.id,
      poNo: po.clientPoNumber || po.id || '-',
      poDate: po.poDate,
      supplier: po.supplier?.name || '-',
      purchaseLocation: po.purchaseLocation?.locationName || '-',
      expectedArrival: po.etaDate || '-',
      products: Array.from(productsSet).join(', '),
      orderedUnits,
      orderedSF: 0,
      subtotal: _.round(subtotal, 2),
      freight: _.round(freight, 2),
      tax: _.round(tax, 2),
      totalPOValue: _.round(totalPOValue, 2),
      receivedUnits,
      receivedSF: _.round(receivedSF, 2),
      receiptPercent: _.round(receiptPercent, 2),
      status: po.status || '-',
      createdBy: po.user?.name || '-',
    };
  });

  return {
    purchaseOrders: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getPurchaseDetailReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getPurchaseDetailReport(clientId, page, limit, locationId);

  const formattedItems = data.purchaseDetails.map((ip: any) => {
    const sipl = ip.sipl || {};
    const po = sipl.purchaseOrder || {};
    const product = ip.product || {};
    const slab = ip.slab || {};
    const location = ip.location || {};

    const length = Number(slab.receivingLength) || 0;
    const width = Number(slab.receivingWidth) || 0;
    const sf = (length * width) / 144;
    
    // Non-slab calculation
    const isSlab = ip.isSlabType || !!ip.slab;
    const activeSF = isSlab ? sf : 1; // Or just use 1 if not a slab, though the report focuses on Slabs

    const unitCostSF = Number(ip.FOBcost) || 0;
    const landedCostSF = Number(ip.landedUnitCost) || 0;
    
    const purchaseCost = unitCostSF * activeSF;
    const totalLandedCost = landedCostSF * activeSF;
    const additionalCost = totalLandedCost - purchaseCost;

    return {
      id: ip.id,
      poNo: po.clientPoNumber || '-',
      poDate: po.poDate || '-',
      supplier: po.supplier?.name || '-',
      productName: product.name || '-',
      category: product.subCategory?.name || '-',
      material: product.group?.name || '-',
      finish: product.finish?.name || '-',
      thickness: product.thickness || '-',
      lotNo: sipl.poSiplNumber || sipl.invoiceCode || sipl.supplierInvoiceNumber || '-',
      bundleNo: slab.block || '-',
      slabNo: slab.slabNumber || slab.serialNumber || '-',
      length: _.round(length, 2),
      width: _.round(width, 2),
      sf: _.round(sf, 2),
      unitCostSF: _.round(unitCostSF, 2),
      purchaseCost: _.round(purchaseCost, 2),
      additionalCost: _.round(additionalCost, 2),
      landedCostSF: _.round(landedCostSF, 2),
      totalLandedCost: _.round(totalLandedCost, 2),
      receivedDate: ip.receivedDate || '-',
      location: location.locationName || '-',
    };
  });

  return {
    purchaseDetails: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getPurchasesBySupplierReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getPurchasesBySupplierReport(clientId, page, limit, locationId);

  const formattedItems = data.vendors.map((vendor: any) => {
    let poCount = 0;
    let productsPurchased = 0;
    let slabsPurchased = 0;
    let totalSF = 0;
    let purchaseValue = 0;
    let landedCost = 0;
    let lastPurchaseDate: Date | null = null;

    const pos = vendor.purchaseOrder || [];
    poCount = pos.length;

    for (const po of pos) {
      if (!lastPurchaseDate || new Date(po.poDate) > lastPurchaseDate) {
        lastPurchaseDate = new Date(po.poDate);
      }

      const requestedProducts = po.requestedPurchaseProducts || [];
      for (const rp of requestedProducts) {
        productsPurchased += Number(rp.quantity) || 0;
        purchaseValue += (Number(rp.quantity) || 0) * (Number(rp.unitPrice) || 0);
      }

      const sipls = po.sipls || [];
      for (const sipl of sipls) {
        if (sipl.inventoryReceived) {
          const ips = sipl.inventoryProducts || [];
          for (const ip of ips) {
            const slab = ip.slab || {};
            const length = Number(slab.receivingLength) || 0;
            const width = Number(slab.receivingWidth) || 0;
            const sf = (length * width) / 144;
            
            const isSlab = ip.isSlabType || !!ip.slab;
            const activeSF = isSlab ? sf : 1;

            if (isSlab) {
              slabsPurchased += 1;
              totalSF += sf;
            }

            landedCost += (Number(ip.landedUnitCost) || 0) * activeSF;
          }
        }
      }
    }

    const freight = landedCost > purchaseValue ? landedCost - purchaseValue : 0;
    const avgLandedCostSF = totalSF > 0 ? landedCost / totalSF : 0;

    return {
      id: vendor.id,
      supplier: vendor.name || '-',
      poCount,
      productsPurchased,
      slabsPurchased,
      totalSF: _.round(totalSF, 2),
      purchaseValue: _.round(purchaseValue, 2),
      freight: _.round(freight, 2),
      landedCost: _.round(landedCost, 2),
      avgLandedCostSF: _.round(avgLandedCostSF, 2),
      lastPurchaseDate: lastPurchaseDate ? lastPurchaseDate.toISOString().split('T')[0] : '-',
    };
  });

  return {
    suppliers: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getInvoiceRegisterReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getInvoiceRegisterReport(clientId, page, limit, locationId);

  const formattedItems = data.invoices.map((inv: any) => {
    const so = inv.salesOrder || {};
    const customer = inv.customer || {};
    const location = inv.location || {};

    const subtotal = Number(inv.amount) || 0;
    const discount = 0; // Not explicitly tracked at invoice level in current schema
    const taxableAmount = Number(inv.taxableAmount) || 0;
    const tax = Number(inv.taxValue) || 0;
    const totalService = Number(inv.totalServiceCharges) || 0;
    const invoiceTotal = subtotal + tax + totalService;

    // Due Date Calculation
    const invoiceDate = new Date(inv.createdAt);
    const dueDate = new Date(invoiceDate);
    if (so.paymentTerm && so.paymentTerm.value !== 'COD') {
      dueDate.setDate(dueDate.getDate() + parseInt(so.paymentTerm.value));
    }
    
    // Amount Paid
    let amountPaid = 0;
    const payments = inv.paymentBills || [];
    for (const p of payments) {
      amountPaid += Number(p.amount) || 0;
    }

    const balanceDue = Math.max(0, invoiceTotal - amountPaid);
    
    let paymentStatus = 'Unpaid';
    if (amountPaid >= invoiceTotal && invoiceTotal > 0) {
      paymentStatus = 'Paid';
    } else if (amountPaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    return {
      id: inv.id,
      invoiceNo: inv.clientSoInvoiceNumber || inv.invoiceCode || '-',
      invoiceDate: invoiceDate.toISOString().split('T')[0],
      soNo: so.clientSoNumber || '-',
      customerName: customer.name || '-',
      customerPoNo: so.customerPoNumber || '-',
      saleLocation: location.locationName || '-',
      subtotal: _.round(subtotal, 2),
      discount: _.round(discount, 2),
      taxableAmount: _.round(taxableAmount, 2),
      tax: _.round(tax, 2),
      invoiceTotal: _.round(invoiceTotal, 2),
      amountPaid: _.round(amountPaid, 2),
      balanceDue: _.round(balanceDue, 2),
      dueDate: dueDate.toISOString().split('T')[0],
      paymentStatus,
    };
  });

  return {
    invoices: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getArAgeingReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getArAgeingReport(clientId, locationId);

  const isDownload = limit === -1;
  const today = new Date();
  
  const allUnpaid: any[] = [];

  for (const inv of data.invoices) {
    const so = inv.salesOrder || {};
    const customer = inv.customer || {};

    const subtotal = Number(inv.amount) || 0;
    const tax = Number(inv.taxValue) || 0;
    const totalService = Number(inv.totalServiceCharges) || 0;
    const invoiceTotal = subtotal + tax + totalService;

    // Due Date Calculation
    const invoiceDate = new Date(inv.createdAt);
    const dueDate = new Date(invoiceDate);
    if (so.paymentTerm && so.paymentTerm.value !== 'COD') {
      dueDate.setDate(dueDate.getDate() + parseInt(so.paymentTerm.value));
    }
    
    // Amount Paid
    let amountPaid = 0;
    const payments = inv.paymentBills || [];
    for (const p of payments) {
      amountPaid += Number(p.amount) || 0;
    }

    const balanceDue = Math.max(0, invoiceTotal - amountPaid);
    
    if (balanceDue > 0) {
      // It's unpaid/open
      const timeDiff = today.getTime() - dueDate.getTime();
      const daysOutstanding = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      let current = 0;
      let day1To30 = 0;
      let day31To60 = 0;
      let day61To90 = 0;
      let day90Plus = 0;

      if (daysOutstanding <= 0) {
        current = balanceDue;
      } else if (daysOutstanding <= 30) {
        day1To30 = balanceDue;
      } else if (daysOutstanding <= 60) {
        day31To60 = balanceDue;
      } else if (daysOutstanding <= 90) {
        day61To90 = balanceDue;
      } else {
        day90Plus = balanceDue;
      }

      allUnpaid.push({
        id: inv.id,
        customerName: customer.name || '-',
        invoiceNo: inv.clientSoInvoiceNumber || inv.invoiceCode || '-',
        invoiceDate: invoiceDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        originalAmount: _.round(invoiceTotal, 2),
        amountPaid: _.round(amountPaid, 2),
        balanceDue: _.round(balanceDue, 2),
        daysOutstanding: daysOutstanding > 0 ? daysOutstanding : 0,
        current: _.round(current, 2),
        day1To30: _.round(day1To30, 2),
        day31To60: _.round(day31To60, 2),
        day61To90: _.round(day61To90, 2),
        day90Plus: _.round(day90Plus, 2),
      });
    }
  }

  // JS Pagination
  const total = allUnpaid.length;
  let paginatedItems = allUnpaid;
  if (!isDownload) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    paginatedItems = allUnpaid.slice(startIndex, endIndex);
  }

  return {
    ageingRecords: paginatedItems,
    total,
    page: isDownload ? 1 : page,
    limit: isDownload ? total : limit,
  };
};

export const getPaymentReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const data = await reportRepository.getPaymentReport(clientId, page, limit, locationId);

  const formattedItems = data.payments.map((p: any) => {
    const customer = p.customer || {};
    const location = p.location || {};
    const createdBy = p.createdBy || {};

    const paymentBills = p.paymentBills || [];
    const invoiceSet = new Set<string>();
    const soSet = new Set<string>();

    for (const pb of paymentBills) {
      if (pb.soInvoice) {
        invoiceSet.add(pb.soInvoice.invoiceCode || pb.soInvoice.clientSoInvoiceNumber || '-');
        if (pb.soInvoice.salesOrder) {
          soSet.add(pb.soInvoice.salesOrder.clientSoNumber || '-');
        }
      }
    }

    return {
      id: p.id,
      paymentNo: p.transactionCode || p.clientTransactionNo || '-',
      paymentDate: p.referenceDate ? new Date(p.referenceDate).toISOString().split('T')[0] : new Date(p.createdAt).toISOString().split('T')[0],
      customerName: customer.name || '-',
      invoiceNos: invoiceSet.size > 0 ? Array.from(invoiceSet).join(', ') : '-',
      soNos: soSet.size > 0 ? Array.from(soSet).join(', ') : '-',
      paymentMethod: p.paymentMethod || '-',
      referenceNo: p.referenceNo || '-',
      amount: _.round(Number(p.amount) || 0, 2),
      location: location.locationName || '-',
      receivedBy: createdBy.name || '-',
    };
  });

  return {
    payments: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getCustomerMasterReport = async (
  clientId: number,
  page: number,
  limit: number
) => {
  const data = await reportRepository.getCustomerMasterReport(clientId, page, limit);

  const formattedItems = data.customers.map((c: any) => {
    const billingAddress = c.billingAddress || {};
    const salesperson = c.primarySalesPerson || {};

    let addrText = billingAddress.address || '-';
    let city = '-';
    let state = '-';
    let zip = '-';

    // attempt to parse if it's JSON
    if (addrText.startsWith('{') && addrText.endsWith('}')) {
      try {
        const parsed = JSON.parse(addrText);
        addrText = parsed.street || parsed.address1 || '-';
        city = parsed.city || '-';
        state = parsed.state || '-';
        zip = parsed.zipCode || parsed.zip || '-';
      } catch (e) {}
    }

    return {
      id: c.id,
      customerCode: c.customerCode || '-',
      customerName: c.name || '-',
      customerType: c.type || '-',
      contactPerson: c.contactName || '-',
      phone: c.primaryPhoneNumber || '-',
      email: c.email || c.accEmail || '-',
      billingAddress: addrText,
      city,
      state,
      zip,
      taxStatus: c.taxExempt ? 'Exempt' : 'Taxable',
      taxId: c.exemptCerti || c.einNumber || '-',
      creditLimit: 0,
      paymentTerms: c.paymentTerm ? c.paymentTerm.value : '-',
      salesperson: salesperson.name || '-',
      status: c.status || '-',
      createdDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '-',
    };
  });

  return {
    customers: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getSupplierMasterReport = async (
  clientId: number,
  page: number,
  limit: number
) => {
  const data = await reportRepository.getSupplierMasterReport(clientId, page, limit);

  const formattedItems = data.suppliers.map((v: any) => {
    let paymentTermVal = '-';
    if (v.paymentTerms) {
      const term = PAYMENT_TERMS.find((t: any) => t.id === v.paymentTerms);
      if (term) paymentTermVal = term.value;
    }

    return {
      id: v.id,
      supplierId: v.id,
      supplierName: v.name || '-',
      contactPerson: v.contactName || '-',
      phone: v.primaryPhoneNo || '-',
      email: v.email || '-',
      address: [v.remitAddress, v.remitSuite].filter(Boolean).join(', ') || '-',
      city: v.remitCity || '-',
      state: v.remitState || '-',
      country: v.remitCountry || '-',
      paymentTerms: paymentTermVal,
      currency: v.currency || '-',
      status: v.status || '-',
      createdDate: v.createdAt ? new Date(v.createdAt).toISOString().split('T')[0] : '-',
    };
  });

  return {
    suppliers: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};

export const getFabricatorMasterReport = async (
  clientId: number,
  page: number,
  limit: number
) => {
  const data = await reportRepository.getFabricatorMasterReport(clientId, page, limit);

  const formattedItems = data.fabricators.map((c: any) => {
    const billingAddress = c.billingAddress || {};

    let addrText = billingAddress.address || '-';
    let city = '-';
    let state = '-';
    let zip = '-';

    if (addrText.startsWith('{') && addrText.endsWith('}')) {
      try {
        const parsed = JSON.parse(addrText);
        addrText = parsed.street || parsed.address1 || '-';
        city = parsed.city || '-';
        state = parsed.state || '-';
        zip = parsed.zipCode || parsed.zip || '-';
      } catch (e) {}
    }

    return {
      id: c.id,
      fabricatorId: c.customerCode || c.id || '-',
      fabricatorName: c.name || '-',
      contactPerson: c.contactName || '-',
      phone: c.primaryPhoneNumber || '-',
      email: c.email || c.accEmail || '-',
      address: addrText,
      city,
      state,
      zip,
      status: c.status || '-',
      createdDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : '-',
    };
  });

  return {
    fabricators: formattedItems,
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
};
