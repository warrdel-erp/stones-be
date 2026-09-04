const fs = require('fs');
const path = './src/services/salesOrder.service.ts';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `  // Calculations for PackagingList
  if (salesOrder.actualLoadingOrders) {
    salesOrder.actualLoadingOrders = salesOrder.actualLoadingOrders.map((lo: any) => {
      lo.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(lo.salesOrderProducts);
      return lo;
    });
  }

  salesOrder.loadingOrders = salesOrder.loadingOrders.map((packagingList: any) => {
    packagingList.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(packagingList.salesOrderProducts);
    packagingList.allProductsInLO = packagingList.salesOrderProducts?.length > 0 && packagingList.salesOrderProducts.every((p: any) => p.loadingOrderId !== null);
    packagingList.totalProducts = packagingList.salesOrderProducts?.length || 0;
    packagingList.assignedProducts = packagingList.salesOrderProducts?.filter((p: any) => p.loadingOrderId !== null).length || 0;
    delete packagingList.salesOrderProducts;
    return packagingList;
  });`;

const newCode = `  // Calculations for PackagingList
  if (salesOrder.actualLoadingOrders) {
    salesOrder.actualLoadingOrders = salesOrder.actualLoadingOrders.map((lo: any) => {
      lo.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(lo.salesOrderProducts);
      lo.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(lo.salesOrderProducts);
      delete lo.salesOrderProducts;
      return lo;
    });
  }

  salesOrder.loadingOrders = salesOrder.loadingOrders.map((packagingList: any) => {
    packagingList.calculations = salesOrderProductRepository.getTotalsOfSalesOrderProducts(packagingList.salesOrderProducts);
    packagingList.allProductsInLO = packagingList.salesOrderProducts?.length > 0 && packagingList.salesOrderProducts.every((p: any) => p.loadingOrderId !== null);
    packagingList.totalProducts = packagingList.salesOrderProducts?.length || 0;
    packagingList.assignedProducts = packagingList.salesOrderProducts?.filter((p: any) => p.loadingOrderId !== null).length || 0;
    packagingList.products = packagingListService.getNestedSalesOrderProductAccordingToIdAndUnitPrice(packagingList.salesOrderProducts);
    delete packagingList.salesOrderProducts;
    return packagingList;
  });`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(path, content);
    console.log("Patched successfully");
} else {
    console.log("Could not find the old code block");
}
