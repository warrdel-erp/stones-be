const fs = require('fs');
const files = [
  '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/packagingList.repository.ts',
  '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/loadingOrder.repository.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // We already added `{ association: 'deliveryItems' }`.
  // Let's replace it with `{ association: 'deliveryItems', include: [{ association: 'delivery' }] }`
  content = content.replace(
    /\{ association: 'deliveryItems' \}/g,
    "{ association: 'deliveryItems', include: [{ association: 'delivery' }] }"
  );

  fs.writeFileSync(file, content);
  console.log('Patched', file);
}
