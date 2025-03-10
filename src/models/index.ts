import Bill from "./bill";
import Bin from "./bin";
import Client from "./client";
import Customer from "./customer.model";
import CustomerAddress from "./customerAddress.model";
import FreightDetail from "./freightDetail";
import InventoryProduct from "./inventoryProduct";
import LedgerAccount from "./ledgerAccount.model";
import LoadingOrder from "./loadingOrder.model";
import LoadingOrderProduct from "./loadingOrderProduct.model";
import Location from "./location";
import Notes from "./note";
import PackagingList from "./packagingList.model";
import PackagingListProduct from "./packagingListProduct.model";
import Payment from "./payment.model";
import Product from "./product";
import ProductCategory from "./productCategory";
import ProductSubCategory from "./productSubCategory";
import PurchaseOrder from "./purchaseOrder";
import RequestedPurchaseProduct from "./requestedPurchaseProduct";
import SalesOrder from "./salesOrder.model";
import SalesOrderProduct from "./salesOrderProduct.model";
import SIPL from "./sipl";
import SIPLProduct from "./siplProduct";
import Slab from "./slab";
import SlabRemeasurement from "./slabRemeasurement.model";
import Transaction from "./transaction.model";
import User from "./user";
import Vendor from "./vendor";
import Warehouse from "./warehouse";

// Client-User relation (one 'Client' have multiple 'Users') (one 'User' can have one 'Client')
Client.hasMany(User, { foreignKey: "clientId" });
User.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// Client-Location relation (one 'Client' have multiple 'Location') (one 'Location' have one 'Client')
Client.hasMany(Location, { foreignKey: "clientId" });
Location.belongsTo(Client, { foreignKey: "clientId" });

// User-Location relation (one 'User' have multiple 'Location') (one 'Location' have multiple 'User')
User.belongsToMany(Location, {
  through: "user_locations",
  foreignKey: "userId",
  as: "locations",
});

Location.belongsToMany(User, {
  through: "user_locations",
  foreignKey: "locationId",
});

// PurchaseOrder-PurchaseLocation (one 'PurchaseOrder' have one 'purchaseLocation')
PurchaseOrder.belongsTo(Location, {
  as: "purchaseLocation",
  foreignKey: "purchaseLocationId",
});

// PurchaseOrder-ShipmentLocation (one 'PurchaseOrder' have one 'shipmentLocation')
PurchaseOrder.belongsTo(Location, {
  as: "shipmentLocation",
  foreignKey: "shipmentLocationId",
});

// (one PO have one Supplier) , (one Vendor as (Supplier) has many POs)
PurchaseOrder.belongsTo(Vendor, { foreignKey: "supplierId", as: "supplier" });
Vendor.hasMany(PurchaseOrder, { foreignKey: "supplierId" });

// PurchaseOrder-User (one 'User' have multiple 'PurchaseOrder') (one 'PurchaseOrder' have one 'User')
User.hasMany(PurchaseOrder, { foreignKey: "userId" });
PurchaseOrder.belongsTo(User, { foreignKey: "userId" });

// PurchaseOrder-InternalNote (A 'PurchaseOrder' has ONE 'Note' as internalNote)
PurchaseOrder.hasMany(Notes, {
  foreignKey: "referenceId",
  as: "notes",
  constraints: false,
});

Notes.belongsTo(PurchaseOrder, {
  foreignKey: "referenceId",
  as: "purchaseOrder",
  constraints: false,
});

// Vender-Notes (one vendor can have one internal note)
Vendor.hasMany(Notes, {
  foreignKey: "referenceId",
  as: "notes",
  constraints: false,
});

Notes.belongsTo(Vendor, {
  foreignKey: "referenceId",
  as: "vendor",
  constraints: false,
});

// Vender-Notes (one vendor can have one internal note)
Bill.hasMany(Notes, {
  foreignKey: "referenceId",
  constraints: false,
});

Notes.belongsTo(Bill, {
  foreignKey: "referenceId",
  constraints: false,
});

// PurchaseOrder-SIPL (one 'PurchaseOrder' have multiple 'SIPL') (one 'SIPL' have one 'PurchaseOrder')
SIPL.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId", as: "purchaseOrder" });
PurchaseOrder.hasMany(SIPL, { foreignKey: "purchaseOrderId", as: "sipls" });

// SIPL-User (SIPL have one 'User' as createdBy) (SIPL have one 'User' as updatedBy)
SIPL.belongsTo(User, { foreignKey: "createdBy" });
SIPL.belongsTo(User, { foreignKey: "updatedBy" });

// FreightDetail optionally belongs to a SIPL
FreightDetail.belongsTo(SIPL, { foreignKey: "siplId" });
SIPL.hasOne(FreightDetail, { foreignKey: "siplId", as: "freightDetail" });

// FreightDetail-PurchaseOrder ('FreightDetail' have one 'PurchaseOrder')
FreightDetail.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
PurchaseOrder.hasOne(FreightDetail, { foreignKey: "purchaseOrderId", as: "freightDetail" });

// FreightDetail-Vendor ('FreightDetail' have one 'Vendor' as freightForwarder)
FreightDetail.belongsTo(Vendor, { foreignKey: "freightForwarderId" });
Vendor.hasMany(FreightDetail, { foreignKey: "freightForwarderId" });

// PurchaseOrder-requestedPurchaseProduct (one 'PurchaseOrder' have multiple 'RequestedPurchaseProduct')
PurchaseOrder.hasMany(RequestedPurchaseProduct, {
  foreignKey: "purchaseOrderId",
  as: "requestedPurchaseProducts",
});

RequestedPurchaseProduct.belongsTo(PurchaseOrder, {
  foreignKey: "purchaseOrderId",
});

// Product-RequestedPurchaseProduct (RequestedPurchaseProduct belongs to one Product) ();
Product.hasMany(RequestedPurchaseProduct, { foreignKey: "productId" });
RequestedPurchaseProduct.belongsTo(Product, { foreignKey: "productId" });

// Product-ProductCategory (one 'Product' have one 'Category') (one 'Category' have multiple 'Product')
Product.belongsTo(ProductCategory, { foreignKey: "categoryId" });
ProductCategory.hasMany(Product, { foreignKey: "categoryId" });

// Product-ProductSubCategory (one 'Product' have one 'SubCategory') (one 'SubCategory' have multiple 'Product')
Product.belongsTo(ProductSubCategory, { foreignKey: "subCategoryId" });
ProductSubCategory.hasMany(Product, { foreignKey: "subCategoryId" });

// Product-User (One 'Product' Belongs to one User) (One User can have multiple 'Products')
Product.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Product, { foreignKey: "createdBy" });

Product.belongsTo(User, { foreignKey: "updatedBy" });
User.hasMany(Product, { foreignKey: "updatedBy" });

// SIPL-SIPLProduct (one 'SIPLProduct' can have belongs to one 'SIPL') (one 'SIPL' have multiple 'SIPLProduct')
SIPL.hasMany(SIPLProduct, { foreignKey: "siplId", as: "siplProducts" });
SIPLProduct.belongsTo(SIPL, { foreignKey: "siplId", as: "sipl" });

Product.hasMany(SIPLProduct, { foreignKey: "productId" });
SIPLProduct.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Slab-Product (one 'Slab' belongs to one 'Product') (one 'Product' can have multiple 'Slabs')
Slab.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Slab, { foreignKey: "productId" });

// Slab-SIPL (one 'Slab' belongs to one 'SIPL') (one 'SIPL' have multiple 'Slabs' )
Slab.belongsTo(SIPL, { foreignKey: "siplId" });
SIPL.hasMany(Slab, { foreignKey: "siplId" });

// One Location has One Warehouse
Location.hasOne(Warehouse, { foreignKey: "locationId" });
Warehouse.belongsTo(Location, { foreignKey: "locationId" });

// One Warehouse has Many Bins
Warehouse.hasMany(Bin, { foreignKey: "warehouseId" });
Bin.belongsTo(Warehouse, { foreignKey: "warehouseId" });

// one Bin has many slabs.
Slab.belongsTo(Bin, { foreignKey: "binId" });
Bin.hasMany(Slab, { foreignKey: "binId" });

// (one Vendor has many Bills) (One Bill belongs to one Ven)
Vendor.hasMany(Bill, { foreignKey: "vendorId" });
Bill.belongsTo(Vendor, { foreignKey: "vendorId" });

// Bill have reference to SIPL
SIPL.hasOne(Bill, {
  foreignKey: "referenceId",
  constraints: false,
  scope: { referenceType: "sipl" },
});

Bill.belongsTo(SIPL, {
  foreignKey: "referenceId",
  constraints: false,
});

// user have one default location ,One location could be default for many users.
User.belongsTo(Location, { foreignKey: "defaultLocationId" });
Location.hasMany(User, { foreignKey: "defaultLocationId" });

// (ProductCategory have multiple sub categories), (One subCategory has one category)
ProductSubCategory.belongsTo(ProductCategory, { foreignKey: "categoryId", as: "category" });
ProductCategory.hasMany(ProductSubCategory, { foreignKey: "categoryId", as: "subCategories" });

// User can have multiple bills
Bill.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Bill, { foreignKey: "createdBy", as: "bills" });

// User can have multiple vendors (One vendor belongs to one User)
Vendor.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Vendor, { foreignKey: "createdBy", as: "vendors" });

// One Bin can have multiple products.
Bin.hasMany(InventoryProduct, { foreignKey: "binId" });
InventoryProduct.belongsTo(Bin, { foreignKey: "binId" });

// One to One relation.
Slab.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId" });
InventoryProduct.hasOne(Slab, { foreignKey: "inventoryProductId" });

// One Ledger account have multiple transaction (one transaction belongs to one Account)
LedgerAccount.hasMany(Transaction, { foreignKey: "ledgerId", as: "transactions" });
Transaction.belongsTo(LedgerAccount, { foreignKey: "ledgerId", as: "ledger" });

// User can create multiple customers (Customer can belongs to one User)
User.hasMany(Customer, { foreignKey: "userId", as: "customers" });
Customer.belongsTo(User, { foreignKey: "userId", as: "user" });

// SO-User (one 'User' have multiple 'SO') (one 'SO' have one 'User')
User.hasMany(SalesOrder, { foreignKey: "userId", as: "salesOrders" });
SalesOrder.belongsTo(User, { foreignKey: "userId", as: "createdBy" });

// One Customer has Many SalesOrders, One SalesOrder belongs to One Customer
Customer.hasMany(SalesOrder, { foreignKey: "customerId" });
SalesOrder.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

// SalesOrder-InternalNote (A 'SalesOrder' has ONE 'Note' as internalNote)
SalesOrder.hasMany(Notes, {
  foreignKey: "referenceId",
  as: "note",
  constraints: false,
});

Notes.belongsTo(SalesOrder, {
  foreignKey: "referenceId",
  as: "salesOrder",
  constraints: false,
});

// Customer can have multiple addresses (one address belongs to one Customer)

// Sales Order can have one shipping address (Customer Address can used in many Sales Orders)
SalesOrder.belongsTo(CustomerAddress, { foreignKey: "shippingAddressId", as: "shippingAddress" });
CustomerAddress.hasMany(SalesOrder, { foreignKey: "shippingAddressId" });

// One SO can have multiple Loading Orders (one Loading Order belongs to just one SO)
SalesOrder.hasMany(LoadingOrder, { foreignKey: "salesOrderId", as: "loadingOrders" });
LoadingOrder.belongsTo(SalesOrder, { foreignKey: "salesOrderId", as: "salesOrder" });

// Loading order have many LoadingOrderSlab
LoadingOrder.hasMany(LoadingOrderProduct, { foreignKey: "loadingOrderId", as: "loadingOrderProducts" });
LoadingOrderProduct.belongsTo(LoadingOrder, { foreignKey: "loadingOrderId", as: "loadingOrder" });

// Inventory product can have multiple LoadingOrderSlab because maybe one is canceled
InventoryProduct.hasMany(LoadingOrderProduct, { foreignKey: "inventoryProductId", as: "loadingOrderProducts" });
LoadingOrderProduct.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });

// One LoadingOrder have one Packaging list.
LoadingOrder.hasOne(PackagingList, { foreignKey: "loadingOrderId", as: "packagingList" });
PackagingList.belongsTo(LoadingOrder, { foreignKey: "loadingOrderId", as: "loadingOrder" });

// Loading order have many LoadingOrderSlab
PackagingList.hasMany(PackagingListProduct, { foreignKey: "packagingListId", as: "packagingListProducts" });
PackagingListProduct.belongsTo(PackagingList, { foreignKey: "packagingListId", as: "packagingList" });

// Inventory product can have multiple LoadingOrderSlab because maybe one is canceled
InventoryProduct.hasMany(PackagingListProduct, { foreignKey: "inventoryProductId", as: "packagingListProducts" });
PackagingListProduct.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });

// SalesOrder have many SalesOrderProduct (one SalesOrderProduct belongs to one Sales Order)
SalesOrderProduct.belongsTo(SalesOrder, { foreignKey: "salesOrderId", as: "salesOrder" });
SalesOrder.hasMany(SalesOrderProduct, { foreignKey: "salesOrderId", as: "salesOrderProducts" });

// One sales Order belongs to inventory product.
SalesOrderProduct.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
InventoryProduct.hasOne(SalesOrderProduct, { foreignKey: "inventoryProductId", as: "salesOrderProduct" });

// One Payment belongs to one user (One user can have multiple payments)
Payment.belongsTo(User, { foreignKey: "userId", as: "createdBy" });
User.hasMany(Payment, { foreignKey: "userId", as: "payments" });

Vendor.belongsTo(Location, { foreignKey: "parentLocation", as: "location" });
Location.hasMany(Vendor, { foreignKey: "parentLocation", as: "vendors" });

// Payment can belongs to many "types" of invoice. but in number it is one. (One invoice can have multiple payments.)
Payment.belongsTo(SIPL, { foreignKey: "invoiceId", as: "sipl" });
SIPL.hasMany(Payment, { foreignKey: "invoiceId", as: "payments" });

// SIPLProduct belongs to one RequestedPurchaseProduct (One RequestedPurchaseProduct can have one SIPLProducts)
SIPLProduct.belongsTo(RequestedPurchaseProduct, {
  foreignKey: "requestedPurchaseProductId",
  as: "requestedPurchaseProduct",
});

RequestedPurchaseProduct.hasMany(SIPLProduct, { foreignKey: "requestedPurchaseProductId", as: "siplProducts" });

// Slab belongs to one SIPLProduct (One SIPLProduct can have multiple Slabs)
Slab.belongsTo(SIPLProduct, { foreignKey: "siplProductId", as: "siplProduct" });
SIPLProduct.hasMany(Slab, { foreignKey: "siplProductId", as: "slabs" });

// Establish one-to-many relationship
Slab.hasMany(SlabRemeasurement, { foreignKey: "slabId", as: "remeasurements" });
SlabRemeasurement.belongsTo(Slab, { foreignKey: "slabId", as: "slab" });

export {
  Client,
  User,
  Location,
  PurchaseOrder,
  Vendor,
  Bin,
  Notes,
  FreightDetail,
  Product,
  RequestedPurchaseProduct,
  SIPL,
  SIPLProduct,
  Slab,
  Warehouse,
  Bill,
  ProductCategory,
  ProductSubCategory,
  InventoryProduct,
  LedgerAccount,
  Transaction,
  Customer,
  CustomerAddress,
  LoadingOrder,
  LoadingOrderProduct,
  PackagingList,
  PackagingListProduct,
  SalesOrder,
  SalesOrderProduct,
  Payment,
  SlabRemeasurement,
};
