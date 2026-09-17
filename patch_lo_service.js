const fs = require('fs');

const file = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/services/loadingOrder.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Ensure Op is imported
if (!content.includes('import { Op } from "sequelize";')) {
    content = content.replace('import { sequelize } from "../config/database";', 'import { sequelize } from "../config/database";\nimport { Op } from "sequelize";\nimport { DELIVERY_STATUS } from "../constants/tableTypes";');
}

const replacement = `    // Determine the distinct packaging lists involved.
    const packagingListIds = new Set<number>();
    
    // Ensure products are not assigned to a delivery
    const sopIds = data.soProducts.map((p: any) => p.id);
    const existingDeliveryItems = await sequelize.models.DeliveryItem.findAll({
      where: { salesOrderProductId: { [Op.in]: sopIds } },
      include: [{
        association: 'delivery',
        where: { status: { [Op.ne]: 'rejected' } } // Fallback hardcoded string since DELIVERY_STATUS might not be imported correctly if I messed up
      }],
      transaction
    });
    
    if (existingDeliveryItems && existingDeliveryItems.length > 0) {
      const conflictSopId = (existingDeliveryItems[0] as any).salesOrderProductId;
      throw new AppError(\`Product \${conflictSopId} is already assigned to a delivery and cannot be added to a loading order.\`, 400);
    }

    // Check concurrency and ensure none of the selected products already have a loadingOrderId`;

content = content.replace(
    /\/\/ Determine the distinct packaging lists involved\.\n\s*const packagingListIds = new Set<number>\(\);\n\n\s*\/\/ Check concurrency and ensure none of the selected products already have a loadingOrderId/,
    replacement
);

fs.writeFileSync(file, content);
console.log('Fixed loadingOrder.service.ts');
