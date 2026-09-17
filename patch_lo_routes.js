const fs = require('fs');
const path = require('path');
const routesPath = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app/src/routes/loadingOrder.routes.ts';
let content = fs.readFileSync(routesPath, 'utf8');
if (!content.includes('/invoicePreview')) {
  content = content.replace(
    /router\.post\("\/:id\/invoice", authenticateUser, loadingOrderController\.invoiceLoadingOrder\);/,
    'router.post("/:id/invoice", authenticateUser, loadingOrderController.invoiceLoadingOrder);\nrouter.get("/:id/invoicePreview", authenticateUser, loadingOrderController.getInvoicePreview);'
  );
  fs.writeFileSync(routesPath, content);
}
