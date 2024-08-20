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
import roleModel from './roleModel.js';
import Permission from './permissionModel.js';
import userRoleModel from './userRoleModel.js';
import rolePermissionModel from './rolePermissionModel.js';
import purchasePaymentModel from './purchasePaymentModel.js';
import containerModel from './containerModel.js';
import permissionModel from './permissionModel.js';
import salesPaymentModel from './salesPaymentModel.js';
// import salesAccountModel from './salesAccountModel.js';
// import salesCreditTransactionModel from './salesCreditTransactionModel.js';
// import salesAccountTransactionModel from './salesAccountTransactionModel.js';
import accountTransactionModel from './accountTransactionModel.js';

userRoleModel.belongsTo(roleModel, { foreignKey: 'role_id' });
roleModel.hasMany(userRoleModel, { foreignKey: 'role_id'});

userRoleModel.belongsTo(userModel, { foreignKey: 'user_id' });
userModel.hasMany(userRoleModel, { foreignKey: 'user_id',as:'UserRole' });

rolePermissionModel.belongsTo(roleModel, { foreignKey: 'role_id' });
roleModel.hasMany(rolePermissionModel, { foreignKey: 'role_id' });

rolePermissionModel.belongsTo(permissionModel, { foreignKey: 'permission_id' });
permissionModel.hasMany(rolePermissionModel, { foreignKey: 'permission_id' });

supplierModel.hasMany(purchaseModel, { foreignKey: 'supplier_id' });
purchaseModel.belongsTo(supplierModel, { foreignKey: 'supplier_id', as: "suppliers" });

locationModel.hasMany(purchaseModel, { foreignKey: 'location_id', sourceKey: 'locationId' });
purchaseModel.belongsTo(locationModel, { foreignKey: 'location_id', targetKey: 'locationId', as: "location" });

locationModel.hasMany(purchaseModel, { foreignKey: 'purchaseLocationId', sourceKey: 'locationId' });
purchaseModel.belongsTo(locationModel, { foreignKey: 'purchaseLocationId', targetKey: 'locationId', as: "purchaseLocation" });

purchaseProductModel.belongsTo(purchaseModel, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
purchaseModel.hasMany(purchaseProductModel, { foreignKey: 'purchase_order_id', as: 'purchaseProduct' });

purchaseProductModel.belongsTo(productModel, { foreignKey: 'product_id', as: 'products' });
productModel.hasMany(purchaseProductModel, { foreignKey: 'product_id' });

purchaseProductModel.hasOne(prePurchaseModel, { foreignKey: 'purchase_order_product_id', as: 'prePurchase' });
prePurchaseModel.belongsTo(purchaseProductModel, { foreignKey: 'purchase_order_product_id' });

poSupplierInvoiceMapperModel.belongsTo(purchaseModel, { foreignKey: 'purchase_order_id' });
purchaseModel.hasMany(poSupplierInvoiceMapperModel, { foreignKey: 'purchase_order_id', as: 'invoiceMapper' });

poSupplierInvoiceModel.belongsTo(poSupplierInvoiceMapperModel, { foreignKey: 'po_supplier_invoice_mapper_id',as:'transactionData' });
poSupplierInvoiceMapperModel.hasMany(poSupplierInvoiceModel, { foreignKey: 'po_supplier_invoice_mapper_id', as: 'supplierInvoice' });

poSlabDetails.belongsTo(poSupplierInvoiceModel, { foreignKey: 'po_supplier_invoice_id' });
poSupplierInvoiceModel.hasMany(poSlabDetails, { foreignKey: 'po_supplier_invoice_id', as: 'slabDetails' });

inventoryInvoiceMapper.belongsTo(productInventoryModel, { foreignKey: 'product_inventory_id', as: 'productInventoryInvoiceMapper' });
productInventoryModel.hasMany(inventoryInvoiceMapper, { foreignKey: 'product_inventory_id', as: 'productInventoryInvoiceMapper' });

purchaseProductModel.hasOne(poSupplierInvoiceModel, { foreignKey: 'purchase_order_product_id', as: 'supplierPurchaseProduct' });
poSupplierInvoiceModel.belongsTo(purchaseProductModel, { foreignKey: 'purchase_order_product_id', as: 'supplierPurchaseProduct' });

poSupplierInvoiceModel.hasOne(inventoryInvoiceMapper, { foreignKey: 'po_supplier_invoice_id', as: 'productInventoryInvoice' });
inventoryInvoiceMapper.belongsTo(poSupplierInvoiceModel, { foreignKey: 'po_supplier_invoice_id', as: 'productInventoryInvoice' });

// poSlabDetails.belongsTo(inventoryInvoiceMapper, { foreignKey: 'po_supplier_invoice_id', as: 'invoiceSlabDetails' });
// inventoryInvoiceMapper.hasMany(poSlabDetails, { foreignKey: 'po_supplier_invoice_id', as: 'invoiceSlabDetails' });

customerModel.hasMany(salesOrderModel, { foreignKey: 'customer_id' });
salesOrderModel.belongsTo(customerModel, { foreignKey: 'customer_id', as: "customers" });

soLoadingOrderModel.belongsTo(salesOrderModel, { foreignKey: 'sales_orders_id' });
salesOrderModel.hasMany(soLoadingOrderModel, { foreignKey: 'sales_orders_id', as: "loadingOrders" });

salesOrderInventoryModel.belongsTo(salesOrderModel, { foreignKey: 'sales_orders_id' });
salesOrderModel.hasMany(salesOrderInventoryModel, { foreignKey: 'sales_orders_id', as: "salesInventory" });

salesOrderInventoryModel.belongsTo(poSlabDetails, { foreignKey: 'po_slab_detail_id', as: "slabDetails" });
poSlabDetails.hasOne(salesOrderInventoryModel, { foreignKey: 'po_slab_detail_id', as: "slabDetails" });

salesOrderInventoryModel.belongsTo(productInventoryModel, { foreignKey: 'product_inventory_id', as: "salesProduct" });
productInventoryModel.hasOne(salesOrderInventoryModel, { foreignKey: 'product_inventory_id', as: "salesProduct" });

productModel.hasMany(productInventoryModel, { foreignKey: 'product_id', as: "salesProductDetails" });
productInventoryModel.belongsTo(productModel, { foreignKey: 'product_id', as: "salesProductDetails" });

subAccountTypesModel.belongsTo(accountTypesModel, { foreignKey: 'account_types_id', as: 'accountTypeSubtype' });
accountTypesModel.hasMany(subAccountTypesModel, { foreignKey: 'account_types_id', as: 'accountTypeSubtype' });

subAccountTypesModel.belongsTo(accountTypesModel, { foreignKey: 'account_types_id', as: 'accountTypes' });
accountTypesModel.hasMany(subAccountTypesModel, { foreignKey: 'account_types_id', as: 'accountTypes' });

accountsModel.belongsTo(subAccountTypesModel, { foreignKey: 'sub_account_types_id', as: 'accountSubtype' });
subAccountTypesModel.hasMany(accountsModel, { foreignKey: 'sub_account_types_id', as: 'accountSubtype' });

purchasePaymentModel.belongsTo(poSupplierInvoiceMapperModel, { foreignKey: 'po_supplier_invoice_mapper_id', as: 'purchaseInvoice' });
poSupplierInvoiceMapperModel.hasMany(purchasePaymentModel, { foreignKey: 'po_supplier_invoice_mapper_id', as: 'purchaseInvoice' });

salesPaymentModel.belongsTo(soLoadingOrderModel,{foreignKey:'so_loading_order_id',as:'so_loading_order'});
soLoadingOrderModel.hasMany(salesPaymentModel,{foreignKey:'so_loading_order_id',as:'so_loading_order'});

salesPaymentModel.belongsTo(salesOrderModel,{foreignKey:'sales_orders_id',as:'salesOrderPaymentDetails'});
salesOrderModel.hasMany(salesPaymentModel,{foreignKey:'sales_orders_id',as:'salesOrderPaymentDetails'});



//common table for transaction
accountTransactionModel.belongsTo(accountsModel,{foreignKey:'accounts_id'})
accountsModel.hasMany(accountTransactionModel,{foreignKey:'accounts_id'});

accountTransactionModel.belongsTo(poSupplierInvoiceMapperModel,{foreignKey:'po_supplier_invoice_mapper_id',as:'poSupplierInvoice'});
poSupplierInvoiceMapperModel.hasMany(accountTransactionModel,{foreignKey:'po_supplier_invoice_mapper_id',as:'poSupplierInvoice'});

accountTransactionModel.belongsTo(purchaseModel,{foreignKey:'purchase_order_id',as:'purchaseOrder'});
purchaseModel.hasMany(accountTransactionModel,{foreignKey:'purchase_order_id',as:'purchaseOrder'});

accountTransactionModel.belongsTo(soLoadingOrderModel,{foreignKey:'so_loading_order_id',as:'soLoadingOrders'});
soLoadingOrderModel.hasMany(accountTransactionModel,{foreignKey:'so_loading_order_id',as:'soLoadingOrders'});

accountTransactionModel.belongsTo(supplierModel,{foreignKey:'supplier_id',as:'supplierTransactions'});
supplierModel.hasMany(accountTransactionModel,{foreignKey:'supplier_id',as:'supplierTransactions'});

accountTransactionModel.belongsTo(customerModel,{foreignKey:'customer_id',as:'customerTransactions'});
customerModel.hasMany(accountTransactionModel,{foreignKey:'customer_id',as:'customerTransactions'});
//changes for inventory

inventoryInvoiceMapper.belongsTo(productInventoryModel,{foreignKey:'product_inventory_id'})
productInventoryModel.hasMany(inventoryInvoiceMapper,{foreignKey:'product_inventory_id',as:'productInventory'});

poSupplierInvoiceModel.belongsTo(productModel,{  foreignKey: 'productSku', targetKey: 'productName',as:'supplierInvoices'});
productModel.hasMany(poSupplierInvoiceModel,{  foreignKey: 'productSku',sourceKey: 'productName',as:'supplierInvoices'});

poSupplierInvoiceMapperModel.belongsTo(productModel,{foreignKey:'po_supplier_invoice_mapper_id',as:'siplData'});
productModel.hasMany(poSupplierInvoiceMapperModel,{foreignKey:'po_supplier_invoice_mapper_id',as:'siplData'});

poSlabDetails.belongsTo(poSupplierInvoiceMapperModel,{foreignKey:'po_supplier_invoice_mapper_id'});
poSupplierInvoiceMapperModel.hasMany(poSlabDetails,{foreignKey:'po_supplier_invoice_mapper_id',as:'siplSlabDetails'});

// poSupplierInvoiceMapperModel.belongsTo(poSlabDetails,{foreignKey:'po_supplier_invoice_mapper_id'});
// poSlabDetails.hasMany(poSupplierInvoiceMapperModel,{foreignKey:'po_supplier_invoice_mapper_id',as:'siplSlabDetails'});

poSupplierInvoiceMapperModel.belongsTo(poSupplierInvoiceModel,{ foreignKey: 'po_supplier_invoice_mapper_id'})
poSupplierInvoiceModel.hasMany(poSupplierInvoiceMapperModel, { foreignKey: 'po_supplier_invoice_mapper_id', as: 'supplierInvoicess' });


poSupplierInvoiceModel.belongsTo(poSupplierInvoiceMapperModel,{ foreignKey: 'po_supplier_invoice_mapper_id'})
poSupplierInvoiceMapperModel.hasMany(poSupplierInvoiceModel, { foreignKey: 'po_supplier_invoice_mapper_id', as: 'supplierInvoicess' });

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
	roleModel,
	Permission,
	userRoleModel,
	rolePermissionModel,
	purchasePaymentModel,
	containerModel,
	salesPaymentModel,
	accountTransactionModel
};