import customerModel from './customerModel.js';
import productModel from './productModel.js';
import userModel from './userModel.js';
import supplierModel from './supplierModel.js';
import settingModel from './settingModel.js';
import purchaseModel from './purchaseOrderModel.js';
import prePurchaseModel from './prePurchaseOrderModel.js';
import purchaseProductModel from './purchaseOrderProductModel.js';
import locationModel from './locationModel.js';
import poSupplierInvoiceModel from './poSupplierInvoiceModel.js';
import poSupplierInvoiceMapperModel from './poSupplierInvoiceMapperModel.js';
import poSlabDetails from './poSlabDetailModel.js';
import productInventoryModel from './productInventoryModel.js';
import inventoryInvoiceMapper from './inventoryInvoiceMapper.js';
import salesOrderModel from './salesOrderModel.js';
import soLoadingOrderModel from './soLoadingOrderModel.js';
import salesOrderInventoryModel from './salesOrdersInventoryModel.js';
import accountsModel from './accountsModel.js';
import accountTypesModel from './accountTypesModel.js';
import subAccountTypesModel from './subAccountTypesModel.js';
import purchasePaymentModel from './purchasePaymentModel.js';
import containerModel from './containerModel.js';

supplierModel.hasMany(purchaseModel, { foreignKey: 'supplier_id' });
purchaseModel.belongsTo(supplierModel, { foreignKey: 'supplier_id',as: "suppliers"});

locationModel.hasMany(purchaseModel, { foreignKey: 'location_id' ,sourceKey: 'locationId'});
purchaseModel.belongsTo(locationModel, { foreignKey: 'location_id' ,targetKey: 'locationId', as: "location"});

locationModel.hasMany(purchaseModel, { foreignKey: 'purchaseLocationId', sourceKey: 'locationId' });
purchaseModel.belongsTo(locationModel, { foreignKey: 'purchaseLocationId', targetKey: 'locationId',as: "purchaseLocation"});

purchaseProductModel.belongsTo(purchaseModel, { foreignKey: 'purchase_order_id',as:'purchaseOrder'});
purchaseModel.hasMany(purchaseProductModel, { foreignKey: 'purchase_order_id',as:'purchaseProduct' });

purchaseProductModel.belongsTo(productModel, { foreignKey: 'product_id', as:'products'});
productModel.hasMany(purchaseProductModel, { foreignKey: 'product_id' });

purchaseProductModel.hasOne(prePurchaseModel, { foreignKey: 'purchase_order_product_id', as:'prePurchase'});
prePurchaseModel.belongsTo(purchaseProductModel, { foreignKey: 'purchase_order_product_id' });

poSupplierInvoiceMapperModel.belongsTo(purchaseModel, { foreignKey: 'purchase_order_id'});
purchaseModel.hasMany(poSupplierInvoiceMapperModel, { foreignKey: 'purchase_order_id',as:'invoiceMapper'});

poSupplierInvoiceModel.belongsTo(poSupplierInvoiceMapperModel, { foreignKey: 'po_supplier_invoice_mapper_id'});
poSupplierInvoiceMapperModel.hasMany(poSupplierInvoiceModel, { foreignKey: 'po_supplier_invoice_mapper_id',as:'supplierInvoice'});

poSlabDetails.belongsTo(poSupplierInvoiceModel, { foreignKey: 'po_supplier_invoice_id'});
poSupplierInvoiceModel.hasMany(poSlabDetails, { foreignKey: 'po_supplier_invoice_id',as:'slabDetails'});

inventoryInvoiceMapper.belongsTo(productInventoryModel, { foreignKey: 'product_inventory_id',as:'productInventoryInvoiceMapper'});
productInventoryModel.hasMany(inventoryInvoiceMapper, { foreignKey: 'product_inventory_id',as:'productInventoryInvoiceMapper'});

purchaseProductModel.hasOne(poSupplierInvoiceModel, { foreignKey: 'purchase_order_product_id', as:'supplierPurchaseProduct'});
poSupplierInvoiceModel.belongsTo(purchaseProductModel, { foreignKey: 'purchase_order_product_id',as:'supplierPurchaseProduct' });

poSupplierInvoiceModel.hasOne(inventoryInvoiceMapper, { foreignKey: 'po_supplier_invoice_id', as:'productInventoryInvoice'});
inventoryInvoiceMapper.belongsTo(poSupplierInvoiceModel, { foreignKey: 'po_supplier_invoice_id',as:'productInventoryInvoice' });

poSlabDetails.belongsTo(inventoryInvoiceMapper, { foreignKey: 'po_supplier_invoice_id',as:'invoiceSlabDetails'});
inventoryInvoiceMapper.hasMany(poSlabDetails, { foreignKey: 'po_supplier_invoice_id',as:'invoiceSlabDetails'});

customerModel.hasMany(salesOrderModel, { foreignKey: 'customer_id' });
salesOrderModel.belongsTo(customerModel, { foreignKey: 'customer_id',as: "customers"});

soLoadingOrderModel.belongsTo(salesOrderModel, { foreignKey: 'sales_orders_id' });
salesOrderModel.hasMany(soLoadingOrderModel, { foreignKey: 'sales_orders_id',as: "loadingOrders"});

salesOrderInventoryModel.belongsTo(salesOrderModel, { foreignKey: 'sales_orders_id' });
salesOrderModel.hasMany(salesOrderInventoryModel, { foreignKey: 'sales_orders_id', as: "salesInventory"});

salesOrderInventoryModel.belongsTo(poSlabDetails, { foreignKey: 'po_slab_detail_id' ,as: "slabDetails"});
poSlabDetails.hasOne(salesOrderInventoryModel, { foreignKey: 'po_slab_detail_id', as: "slabDetails"});

salesOrderInventoryModel.belongsTo(productInventoryModel, { foreignKey: 'product_inventory_id', as: "salesProduct"});
productInventoryModel.hasOne(salesOrderInventoryModel, { foreignKey: 'product_inventory_id', as: "salesProduct"});

productModel.hasOne(productInventoryModel, { foreignKey: 'product_id', as: "salesProductDetails"});
productInventoryModel.belongsTo(productModel, { foreignKey: 'product_id', as: "salesProductDetails"});

subAccountTypesModel.belongsTo(accountTypesModel, { foreignKey: 'account_types_id',as:'accountTypeSubtype'});
accountTypesModel.hasMany(subAccountTypesModel, { foreignKey: 'account_types_id',as:'accountTypeSubtype'});

subAccountTypesModel.belongsTo(accountTypesModel, { foreignKey: 'account_types_id',as:'accountTypes'});
accountTypesModel.hasMany(subAccountTypesModel, { foreignKey: 'account_types_id',as:'accountTypes'});

accountsModel.belongsTo(subAccountTypesModel, { foreignKey: 'sub_account_types_id',as:'accountSubtype'});
subAccountTypesModel.hasMany(accountsModel, { foreignKey: 'sub_account_types_id',as:'accountSubtype'});

purchasePaymentModel.belongsTo(poSupplierInvoiceMapperModel, { foreignKey: 'po_supplier_invoice_mapper_id',as:'purchaseInvoice'});
poSupplierInvoiceMapperModel.hasMany(purchasePaymentModel, { foreignKey: 'po_supplier_invoice_mapper_id',as:'purchaseInvoice'});

export {
	productModel,
	userModel,
	supplierModel,
	settingModel,
	purchaseModel,
	prePurchaseModel,
	purchaseProductModel,
	locationModel,
	poSupplierInvoiceModel,
	poSupplierInvoiceMapperModel,
	poSlabDetails,
	productInventoryModel,
	inventoryInvoiceMapper,
	customerModel,
	salesOrderModel,
	soLoadingOrderModel,
	salesOrderInventoryModel,
	accountsModel,
	subAccountTypesModel,
	accountTypesModel,
	purchasePaymentModel,
	containerModel,
  };