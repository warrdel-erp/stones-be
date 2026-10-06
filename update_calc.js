const fs = require('fs');
let content = fs.readFileSync('src/repositories/salesOrderProduct.repository.ts', 'utf8');

// Replace calcs definition to remove taxable
content = content.replace(/taxable: 0,/g, '');

// Remove all if (salesOrderProduct.taxApplied) { ... } blocks
content = content.replace(/if \(salesOrderProduct\.taxApplied\) {[\s\S]*?}/g, '');

// Remove from applyDiscount
content = content.replace(/const taxableDiscount[\s\S]*?toDP\(3\)\.toNumber\(\);/g, '');

fs.writeFileSync('src/repositories/salesOrderProduct.repository.ts', content);
