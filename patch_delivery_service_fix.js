const fs = require('fs');

const file = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/services/delivery.service.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /if \(ref\.salesOrderProductIds && ref\.salesOrderProductIds\.length > 0\) \{/g,
    'if (ref.salesOrderProductIds !== undefined) {'
);

fs.writeFileSync(file, content);
console.log('Fixed delivery.service.ts');
