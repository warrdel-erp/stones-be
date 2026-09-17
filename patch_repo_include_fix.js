const fs = require('fs');

function fixRepo(file) {
  let content = fs.readFileSync(file, 'utf8');

  // We want to insert `{ association: 'deliveryItems', include: [{ association: 'delivery' }] },`
  // inside the `include` array for `association: "salesOrderProducts"` or `association: 'salesOrderProducts'`

  // A reliable way is to find `association: "salesOrderProducts",` and the next `include: [` and insert it there.
  const regex = /(association:\s*['"]salesOrderProducts['"]\s*,[\s\S]*?include:\s*\[)/g;
  
  content = content.replace(regex, `$1\n            { association: 'deliveryItems', include: [{ association: 'delivery' }] },`);

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}

fixRepo('/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/packagingList.repository.ts');
fixRepo('/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/loadingOrder.repository.ts');

