const fs = require('fs');
let content = fs.readFileSync('src/services/packagingList.service.ts', 'utf8');

// Function 1: getTotalPackagingListAmount
const str1 = `    // Calculate Total Amount
    if (salesOrderProduct.taxApplied) {
      if (salesOrderProduct?.inventoryProduct?.slab) {
        taxableAmount += (salesOrderProduct.plRemeasureLength * salesOrderProduct.plRemeasureWidth * salesOrderProduct.unitPrice) / 144;
      } else {
        taxableAmount += Number(salesOrderProduct.unitPrice);
      }
    }`;
const rep1 = `    taxableAmount = totalAmount;`;
content = content.replace(str1, rep1);

// Function 2: getRemainingPackagingListAmount (line 354)
const str2 = `    // Calculate Total Amount
    if (salesOrderProduct.taxApplied) {
      if (salesOrderProduct?.inventoryProduct?.slab) {
        taxableAmount += (salesOrderProduct.inventoryProduct.slab.receivingLength * salesOrderProduct.inventoryProduct.slab.receivingWidth * salesOrderProduct.unitPrice) / 144;
      } else {
        taxableAmount += Number(salesOrderProduct.unitPrice);
      }
    }`;
const rep2 = `    taxableAmount = totalAmount;`;
content = content.replace(str2, rep2);

// Function 3 (line 397): taxApplied: !!salesOrderProductsAsPerProduct[0]?.taxApplied
const str3 = `taxApplied: !!salesOrderProductsAsPerProduct[0]?.taxApplied,`;
content = content.replace(str3, '');

fs.writeFileSync('src/services/packagingList.service.ts', content);
