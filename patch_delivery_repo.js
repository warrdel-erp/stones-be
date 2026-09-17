const fs = require('fs');
const file = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/delivery.repository.ts';
let content = fs.readFileSync(file, 'utf8');

const newMethod = `
export const findExistingDeliveryItemsBySopIds = async (sopIds: number[]) => {
    return scoped(models.DeliveryItem).findAll({
        where: { salesOrderProductId: { [Op.in]: sopIds } },
        include: [
            {
                association: 'delivery',
                where: { status: { [Op.ne]: DELIVERY_STATUS.REJECTED } }
            }
        ]
    });
};
`;

if (!content.includes('findExistingDeliveryItemsBySopIds')) {
    content = content.replace('export const createDelivery =', newMethod + '\nexport const createDelivery =');
    fs.writeFileSync(file, content);
    console.log('Patched delivery.repository.ts');
} else {
    console.log('Already patched delivery.repository.ts');
}
