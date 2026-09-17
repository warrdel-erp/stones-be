const fs = require('fs');
const path = require('path');

const beAppDir = '/Users/jitin/Main/warrdel/stone/stone-crm-be-app';

const servicePath = path.join(beAppDir, 'src/services/loadingOrder.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

const previewServiceCode = `
export const getInvoicePreview = async (loadingOrderId: number) => {
  const loadingOrder: any = await loadingOrderRepository.getLoadingOrderById(Number(loadingOrderId));

  if (!loadingOrder) {
    throw new AppError(\`Loading Order not found with id: \${loadingOrderId}\`, 400);
  }

  if (loadingOrder.stage === PACKAGING_LIST_STAGES.INVOICED) {
    throw new AppError('Loading Order is already invoiced.', 400);
  }

  const invoiceAmountObj = loadingOrder.calculations.loadingOrder;
  let serviceTotals = 0; // if you have tradeServices on LO, calculate here, else 0

  const actualSalesOrder = loadingOrder.packagingList?.salesOrder || loadingOrder.salesOrder;
  const invoiceTotal = decimal.decimalAdd(invoiceAmountObj.total, serviceTotals);

  const salesOrderId = actualSalesOrder.id;
  const deposits: any[] = await scoped(models.AdvancedDeposit).findAll({
    where: { salesOrderId },
    order: [['createdAt', 'ASC']],
    include: [
      {
        association: 'settlements',
        attributes: ['amount'],
      }
    ],
  });

  let remainingInvoiceBalance = new Decimal(invoiceTotal);
  const depositPreviews: Array<{
    depositId: number;
    depositCode: string;
    depositAmount: number;
    alreadySettled: number;
    availableBalance: number;
    willBeSettled: number;
  }> = [];

  for (const dep of deposits) {
    if (remainingInvoiceBalance.lte(0)) break;

    const depAmount = new Decimal(dep.amount);
    let settledSoFar = new Decimal(0);
    if (dep.settlements && dep.settlements.length > 0) {
      settledSoFar = dep.settlements.reduce(
        (sum: Decimal, s: any) => sum.plus(new Decimal(s.amount)),
        new Decimal(0)
      );
    }
    const available = depAmount.minus(settledSoFar);

    if (available.gt(0)) {
      let settlementAmount = new Decimal(0);
      if (available.gte(remainingInvoiceBalance)) {
        settlementAmount = remainingInvoiceBalance;
        remainingInvoiceBalance = new Decimal(0);
      } else {
        settlementAmount = available;
        remainingInvoiceBalance = remainingInvoiceBalance.minus(available);
      }

      depositPreviews.push({
        depositId: dep.id as number,
        depositCode: dep.code,
        depositAmount: depAmount.toNumber(),
        alreadySettled: settledSoFar.toNumber(),
        availableBalance: available.toNumber(),
        willBeSettled: settlementAmount.toNumber(),
      });
    }
  }

  const totalWillBeSettled = depositPreviews.reduce((sum, d) => sum + d.willBeSettled, 0);

  return {
    invoiceSummary: {
      subTotal: invoiceAmountObj.subTotal,
      taxable: invoiceAmountObj.taxable,
      tax: invoiceAmountObj.tax,
      serviceCharges: serviceTotals,
      total: invoiceTotal.toNumber(),
    },
    depositPreviews,
    totalWillBeSettled,
    remainingDueAfterSettlement: remainingInvoiceBalance.toNumber(),
  };
};
`;

if (!serviceContent.includes('export const getInvoicePreview')) {
  // we need `decimal` from 'decimal.js' and `models` from '../models'
  if (!serviceContent.includes("import Decimal")) {
    serviceContent = serviceContent.replace("import { sequelize }", "import Decimal from 'decimal.js';\nimport { sequelize }");
  }
  if (!serviceContent.includes("import * as decimal")) {
    serviceContent = serviceContent.replace("import Decimal from 'decimal.js';", "import Decimal from 'decimal.js';\nimport * as decimal from '../utils/decimal';");
  }
  if (!serviceContent.includes("import * as models")) {
    serviceContent = serviceContent.replace("import { sequelize }", "import * as models from '../models';\nimport { sequelize }");
  }
  if (!serviceContent.includes("import { scoped }")) {
    serviceContent = serviceContent.replace("import { sequelize }", "import { scoped } from '../utils/scoped';\nimport { sequelize }");
  }

  serviceContent += '\n\n' + previewServiceCode;
  fs.writeFileSync(servicePath, serviceContent);
}

const controllerPath = path.join(beAppDir, 'src/controllers/loadingOrder.controller.ts');
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

if (!controllerContent.includes('export const getInvoicePreview')) {
  const previewControllerCode = `
export const getInvoicePreview = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const preview = await loadingOrderService.getInvoicePreview(Number(id));
  SuccessResponse(res, 200, "Invoice preview fetched successfully", preview);
});
`;
  controllerContent += '\n\n' + previewControllerCode;
  fs.writeFileSync(controllerPath, controllerContent);
}

const routesPath = path.join(beAppDir, 'src/routes/loadingOrder.routes.ts');
let routesContent = fs.readFileSync(routesPath, 'utf8');

if (!routesContent.includes('/invoicePreview')) {
  routesContent = routesContent.replace(
    /router\.post\("\/:id\/invoice", authenticateUser, loadingOrderController\.createInvoice\);/,
    'router.post("/:id/invoice", authenticateUser, loadingOrderController.createInvoice);\nrouter.get("/:id/invoicePreview", authenticateUser, loadingOrderController.getInvoicePreview);'
  );
  fs.writeFileSync(routesPath, routesContent);
}
