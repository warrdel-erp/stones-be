const fs = require('fs');

let content = fs.readFileSync('src/repositories/salesOrderProduct.repository.ts', 'utf8');

// Initialize inlineDiscountAmount
content = content.replace(
  "soReceiving: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0 },",
  "soReceiving: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0 },"
);
content = content.replace(
  "packagingList: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0 },",
  "packagingList: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0 },"
);
content = content.replace(
  "loadingOrder: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0 },",
  "loadingOrder: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0 },"
);
content = content.replace(
  "final: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0 },",
  "final: { subTotal: 0, tax: 0, total: 0, discountAmount: 0, taxable: 0, inlineDiscountAmount: 0 },"
);

// In the loop, calculate inline discounts
const loopRegex = /for \(const salesOrderProduct of salesOrderProducts\) \{([\s\S]*?)\}/;
const loopMatch = content.match(loopRegex);

if (loopMatch) {
    let loopBody = loopMatch[1];
    
    // We add inline discount calculation
    let newLoopBody = `
    const pInlineDiscount = Number(salesOrderProduct.discountPercentage) || 0;
    
    const amt = Number(salesOrderProduct.amount) || 0;
    calcs.soReceiving.subTotal = decimals.decimalAddDP(calcs.soReceiving.subTotal, amt, 2);
    calcs.soReceiving.inlineDiscountAmount = decimals.decimalAddDP(calcs.soReceiving.inlineDiscountAmount, decimals.decimalValueByPercentage(amt, pInlineDiscount, 2), 2);
    
    calcs.receiving.total = decimals.decimalAddDP(calcs.receiving.total, Number(salesOrderProduct.inventoryProduct?.assetValue) || 0, 2);
    
    const plAmt = Number(salesOrderProduct.plAmount) || 0;
    calcs.packagingList.subTotal = decimals.decimalAddDP(calcs.packagingList.subTotal, plAmt, 2);
    calcs.packagingList.inlineDiscountAmount = decimals.decimalAddDP(calcs.packagingList.inlineDiscountAmount, decimals.decimalValueByPercentage(plAmt, pInlineDiscount, 2), 2);
    
    const loAmt = Number(salesOrderProduct.loAmount) || 0;
    calcs.loadingOrder.subTotal = decimals.decimalAddDP(calcs.loadingOrder.subTotal, loAmt, 2);
    calcs.loadingOrder.inlineDiscountAmount = decimals.decimalAddDP(calcs.loadingOrder.inlineDiscountAmount, decimals.decimalValueByPercentage(loAmt, pInlineDiscount, 2), 2);
    
    if (salesOrderProduct.isSlabType) {
      calcs.quantities.receiving = decimals.decimalAddDP(calcs.quantities.receiving, Number(salesOrderProduct.receivingAreaSqFt) || 0, 2);
      calcs.quantities.packagingList = decimals.decimalAddDP(calcs.quantities.packagingList, Number(salesOrderProduct.plSqrFt) || 0, 2);
      calcs.quantities.loadingOrder = decimals.decimalAddDP(calcs.quantities.loadingOrder, Number(salesOrderProduct.loSqrFt) || 0, 2);
    } else {
      calcs.quantities.receiving = decimals.decimalAddDP(calcs.quantities.receiving, 1, 2);
      if (salesOrderProduct.loAmount) {
        calcs.quantities.loadingOrder = decimals.decimalAddDP(calcs.quantities.loadingOrder, 1, 2);
      }
      if (salesOrderProduct.plAmount) {
        calcs.quantities.packagingList = decimals.decimalAddDP(calcs.quantities.packagingList, 1, 2);
      }
    }`;
    content = content.replace(loopRegex, `for (const salesOrderProduct of salesOrderProducts) {${newLoopBody}\n  }`);
}

// After loop, change discountAmount calculation to be based on (subTotal - inlineDiscountAmount)
// Find the block // --- Calculate Discounts ---
const discountsBlock = `// --- Calculate Discounts ---
  if (discountPercentage > 0) {
    const soAfterInline = decimals.decimalSubtractDP(calcs.soReceiving.subTotal, calcs.soReceiving.inlineDiscountAmount, 2);
    calcs.soReceiving.discountAmount = decimals.decimalValueByPercentage(soAfterInline, discountPercentage, 2);
    
    const plAfterInline = decimals.decimalSubtractDP(calcs.packagingList.subTotal, calcs.packagingList.inlineDiscountAmount, 2);
    calcs.packagingList.discountAmount = decimals.decimalValueByPercentage(plAfterInline, discountPercentage, 2);
    
    const loAfterInline = decimals.decimalSubtractDP(calcs.loadingOrder.subTotal, calcs.loadingOrder.inlineDiscountAmount, 2);
    calcs.loadingOrder.discountAmount = decimals.decimalValueByPercentage(loAfterInline, discountPercentage, 2);
  } else {
    calcs.soReceiving.discountAmount = 0;
    calcs.packagingList.discountAmount = 0;
    calcs.loadingOrder.discountAmount = 0;
  }

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

  // --- Calculate Totals ---
  calcs.soReceiving.total = decimals.decimalAddDP(soAmountAfterDiscount, calcs.soReceiving.tax, 2);
  calcs.packagingList.total = decimals.decimalAddDP(plAmountAfterDiscount, calcs.packagingList.tax, 2);
  calcs.loadingOrder.total = decimals.decimalAddDP(loAmountAfterDiscount, calcs.loadingOrder.tax, 2);`;

content = content.replace(/\/\/ --- Calculate Discounts ---[\s\S]*?\/\/ --- Calculate Totals ---[\s\S]*?calcs\.loadingOrder\.tax\);/g, discountsBlock);

fs.writeFileSync('src/repositories/salesOrderProduct.repository.ts', content);

