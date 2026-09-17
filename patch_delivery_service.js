const fs = require('fs');
const file = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/services/delivery.service.ts';
let content = fs.readFileSync(file, 'utf8');

// replace DeliveryReference definition
content = content.replace(
    /type DeliveryReference = \{ id: number; referenceType: 'packagingList' \| 'loadingOrder' \};/,
    `type DeliveryReference = { id: number; referenceType: 'packagingList' | 'loadingOrder'; salesOrderProductIds?: number[] };`
);

// We need to replace the check for existing PLs and LOs
const oldCheck = `    // Check if any reference already has an active delivery
    const plIds = references.filter(r => r.referenceType === 'packagingList').map(r => r.id);
    const loIds = references.filter(r => r.referenceType === 'loadingOrder').map(r => r.id);

    if (plIds.length > 0) {
        const existing = await deliveryRepository.findExistingDeliveryAddressesByReferenceIds(plIds, 'packagingList');
        if (existing.length > 0) {
            const usedIds = existing.map((d: any) => d.get('referenceId')).join(', ');
            throw new AppError(\`The following Packaging Lists already have a delivery assigned: [\${usedIds}].\`, 400);
        }
    }
    if (loIds.length > 0) {
        const existing = await deliveryRepository.findExistingDeliveryAddressesByReferenceIds(loIds, 'loadingOrder');
        if (existing.length > 0) {
            const usedIds = existing.map((d: any) => d.get('referenceId')).join(', ');
            throw new AppError(\`The following Loading Orders already have a delivery assigned: [\${usedIds}].\`, 400);
        }
    }`;

const newCheck = `    // The check for existing items is moved down inside the transaction after we get the salesOrderProducts`;
content = content.replace(oldCheck, newCheck);


// Now replace the inside of the transaction loop
const oldLoopPart = `            if (!salesOrderProducts.length) {
                throw new AppError(\`No salesOrderProducts found for \${ref.referenceType} \${ref.id}\`, 400);
            }

            currentLoadCount += salesOrderProducts.length;
            if (truckData.capacity && currentLoadCount > truckData.capacity) {
                throw new AppError(\`Cannot assign: Total load (\${currentLoadCount} slabs) exceeds truck capacity (\${truckData.capacity} slabs).\`, 400);
            }`;

const newLoopPart = `            if (ref.salesOrderProductIds && ref.salesOrderProductIds.length > 0) {
                salesOrderProducts = salesOrderProducts.filter((sop: any) => ref.salesOrderProductIds?.includes(sop.id));
            }

            if (!salesOrderProducts.length) {
                throw new AppError(\`No salesOrderProducts found for \${ref.referenceType} \${ref.id}\`, 400);
            }

            // check if any of these products are already assigned
            const sopIds = salesOrderProducts.map((sop: any) => sop.id);
            const existingItems = await deliveryRepository.findExistingDeliveryItemsBySopIds(sopIds);
            if (existingItems.length > 0) {
                throw new AppError(\`Some products in \${ref.referenceType} \${ref.id} are already assigned to a delivery.\`, 400);
            }

            currentLoadCount += salesOrderProducts.length;
            if (truckData.capacity && currentLoadCount > truckData.capacity) {
                throw new AppError(\`Cannot assign: Total load (\${currentLoadCount} slabs) exceeds truck capacity (\${truckData.capacity} slabs).\`, 400);
            }`;

content = content.replace(oldLoopPart, newLoopPart);

fs.writeFileSync(file, content);
console.log('Patched delivery.service.ts');
