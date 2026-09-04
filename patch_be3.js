const fs = require('fs');
const path = './src/repositories/salesOrder.repository.ts';
let content = fs.readFileSync(path, 'utf8');

const oldInclude2 = `          {
            association: 'salesOrderProducts',
            include: [{ association: 'inventoryProduct' }]
          },`;

const newInclude2 = `          {
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

content = content.replace(oldInclude2, newInclude2);

fs.writeFileSync(path, content);
