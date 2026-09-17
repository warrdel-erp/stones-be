const fs = require('fs');

function patchRepo(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Look for deliveryAddresses include block
    const oldInclude = `        association: 'deliveryAddresses',
        required: false,
        separate: true,
        include: [
          {
            association: 'delivery',`;

    const newInclude = `        association: 'deliveryAddresses',
        required: false,
        separate: true,
        include: [
          { association: 'deliveryItems' },
          {
            association: 'delivery',`;
            
    if (content.includes(oldInclude)) {
        content = content.replace(oldInclude, newInclude);
        fs.writeFileSync(file, content);
        console.log('Patched', file);
    } else {
        console.log('Could not find include block in', file);
    }
}

patchRepo('/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/packagingList.repository.ts');
patchRepo('/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/loadingOrder.repository.ts');
