const fs = require('fs');
const file = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/salesOrder.repository.ts';
let content = fs.readFileSync(file, 'utf8');

// Insert `{ association: 'deliveryItems', include: [{ association: 'delivery' }] },` after `loadingOrderId: null }, required: false, include: [`
// in both getSalesOrderByIdForCreateActualLO and getSalesOrderByIdForCreateLO

const regex = /(association:\s*"salesOrderProducts",[\s\S]*?include:\s*\[)/g;
content = content.replace(regex, `$1\n          { association: 'deliveryItems', include: [{ association: 'delivery' }] },`);

fs.writeFileSync(file, content);
console.log('Fixed salesOrder.repository.ts');
