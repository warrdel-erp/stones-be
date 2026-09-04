const fs = require('fs');
const path = './src/repositories/salesOrder.repository.ts';
let content = fs.readFileSync(path, 'utf8');

const oldInclude1 = `          {
            association: 'salesOrderProducts',
            include: [
              {
                association: 'inventoryProduct'
              }
            ]
          },`;

const newInclude1 = `          {
            association: 'salesOrderProducts',
            include: [
              {
                association: 'inventoryProduct',
                include: [
                  { association: 'product' },
                  { association: 'bin', attributes: ['id', 'name'] },
                  { association: 'slab' },
                  { association: 'genericProduct' }
                ]
              }
            ]
          },`;

// Replace ALL occurrences of oldInclude1 (for both loadingOrders and actualLoadingOrders)
content = content.replaceAll(oldInclude1, newInclude1);

fs.writeFileSync(path, content);
