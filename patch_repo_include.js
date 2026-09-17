const fs = require('fs');
const files = [
  '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/packagingList.repository.ts',
  '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/loadingOrder.repository.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // In packagingList.repository.ts:
  // { association: 'inventoryProduct', include: [ { association: 'product' }, { association: 'slab' } ] }
  content = content.replace(
    /\{ association: 'inventoryProduct',/g,
    "{ association: 'deliveryItems' }, { association: 'inventoryProduct',"
  );

  fs.writeFileSync(file, content);
  console.log('Patched', file);
}
