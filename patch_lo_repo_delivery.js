const fs = require('fs');
const file = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/repositories/loadingOrder.repository.ts';
let content = fs.readFileSync(file, 'utf8');

const oldPending = `      whereClause.id = {
        [Op.notIn]: sequelize.literal(\`(
          SELECT da.referenceId FROM delivery_addresses da
          JOIN deliveries d ON da.deliveryId = d.id
          WHERE da.referenceType = 'loadingOrder'
          AND d.status IN ('pending', 'approved', 'started', 'completed')
        )\`)
      };`;

const newPending = `      whereClause.id = {
        [Op.in]: sequelize.literal(\`(
          SELECT sop.loadingOrderId FROM sales_order_products sop
          WHERE sop.loadingOrderId IS NOT NULL
          AND sop.id NOT IN (
            SELECT di.salesOrderProductId FROM delivery_items di
            JOIN deliveries d ON di.deliveryId = d.id
            WHERE d.status IN ('pending', 'approved', 'started', 'completed')
          )
        )\`)
      };`;

const oldAssigned = `      whereClause.id = {
        [Op.in]: sequelize.literal(\`(
          SELECT da.referenceId FROM delivery_addresses da
          JOIN deliveries d ON da.deliveryId = d.id
          WHERE da.referenceType = 'loadingOrder'
          AND d.status IN ('pending', 'approved', 'started')
        )\`)
      };`;

const newAssigned = `      whereClause.id = {
        [Op.in]: sequelize.literal(\`(
          SELECT sop.loadingOrderId FROM sales_order_products sop
          WHERE sop.loadingOrderId IS NOT NULL
          AND sop.id IN (
            SELECT di.salesOrderProductId FROM delivery_items di
            JOIN deliveries d ON di.deliveryId = d.id
            WHERE d.status IN ('pending', 'approved', 'started', 'completed')
          )
        )\`)
      };`;

content = content.replace(oldPending, newPending);
content = content.replace(oldAssigned, newAssigned);

fs.writeFileSync(file, content);
console.log('Patched loadingOrder.repository.ts');
