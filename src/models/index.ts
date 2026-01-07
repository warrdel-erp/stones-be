import Bill from "./bill.model";
import BillItem from "./billItem.model";
import Bin from "./bin.model";
import Client from "./client.model";
import Company from "./company.model";
import Container from "./container.model";
import Customer from "./customer.model";
import CustomerAddress from "./customerAddress.model";
import FreightDetail from "./freightDetail";
import InventoryProduct from "./inventoryProduct.model";
import LedgerAccount from "./ledgerAccount.model";
import LoadingOrder from "./loadingOrder.model";
import LoadingOrderProduct from "./loadingOrderProduct.model";
import Location from "./location.model";
import Notes from "./note.model";
import PackagingList from "./packagingList.model";
import Payment from "./payment.model";
import PaymentBill from "./paymentBills.model";
import Product from "./product.model";
import ProductSubCategory from "./productSubCategory";
import PurchaseOrder from "./purchaseOrder.model";
import RequestedPurchaseProduct from "./requestedPurchaseProduct";
import SalesOrder from "./salesOrder.model";
import SalesOrderProduct from "./salesOrderProduct.model";
import SIPL from "./sipl.model";
import SIPLProduct from "./siplProduct.model";
import Slab from "./slab.model";
import SlabRemeasurement from "./slabRemeasurement.model";
import JournalEntry from "./journalEntry.model";
import User from "./user.model";
import Vendor from "./vendor.model";
import Warehouse from "./warehouse.model";
import SalesOrderInvoice from "./salesOrderInvoice.model";
import Truck from "./truck.model";
import Account from "./Account.model";
import CartItem from "./cartItem.model";
import { CUSTOMER_ADDRESS_TYPES, JOURNAL_ENTRY_SUB_REFERENCE_TYPES, LEDGER_ACCOUNT_REFERENCE_TYPES, PAYMENT_BILL_REFERENCE_TYPES } from "../constants/tableTypes";
import ProductGroup from "./productGroup.model";
import ProductBaseColor from "./productBaseColor.model";
import ProductFinish from "./productFinish.model";
import AdvancedDeposit from "./advancedDeposit.model";
import AdvancedDepositSettlement from "./advancedDepositSettlement.model";
import Return from "./return.model";
import ReturnProduct from "./returnProduct.model";
import Delivery from "./Delivery.model";
import InvoiceDelivery from "./InvoiceDelivery.model";
import ServiceCategory from "./serviceCategory.model";
import Service from "./service.model";
import TradeService, { TRADE_SERVICE_REFERENCE_TYPES } from "./tradeService.model";
import GenericProduct from "./genericProduct.model";
import CreditDebitNote from "./creditDebitNote.model";
import SoProductSwapHistory from "./soProductSwapHistory.model";
import InventoryProductHold from "./inventoryProductHold.model";
import SelectionSheet from "./selectionSheet.model";
import SelectionSheetItem from "./selectionSheetItem.model";
import AccountPermission from "./AccountPermission.model";
import TermsCondition from "./termsCondition.model";

// Client-User relation (one 'Client' have multiple 'Users') (one 'User' can have one 'Client')
// Client-User relation (one 'Client' have multiple 'Users') (one 'User' can have one 'Client')
Client.hasMany(User, { foreignKey: "clientId", as: "users" });
User.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// User-AccountPermission relation
Account.hasMany(AccountPermission, { foreignKey: "accountId", as: "permissions" });
AccountPermission.belongsTo(Account, { foreignKey: "accountId", as: "account" });

// Define associations
User.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
Account.hasOne(User, { foreignKey: 'accountId', as: 'user' });

// Define associations
Client.belongsTo(Account, { foreignKey: 'accountId', as: 'account' });
Account.hasOne(Client, { foreignKey: 'accountId', as: 'client' });

// User createdBy reference to Account
User.belongsTo(Account, { foreignKey: 'createdById', as: 'createdBy' });
Account.hasMany(User, { foreignKey: 'createdById', as: 'createdUsers' });

// CartItem reverse associations (hasMany/hasOne defined here for Account, InventoryProduct, and Client)
Account.hasMany(CartItem, { foreignKey: "accountId", as: "cartItems" });
InventoryProduct.hasOne(CartItem, { foreignKey: "inventoryProductId", as: "cartItem" });
Client.hasMany(CartItem, { foreignKey: "clientId", as: "cartItems" });

// Client-Company relation (one-to-one)
Client.hasOne(Company, { foreignKey: "clientId", as: "company" });
Company.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// Client-Location relation (one 'Client' have multiple 'Location') (one 'Location' have one 'Client')
Client.hasMany(Location, { foreignKey: "clientId", as: 'locations' });
Location.belongsTo(Client, { foreignKey: "clientId", as: "client" });

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

// SIPL-PurchaseLocation (one 'SIPL' have one 'purchaseLocation')
SIPL.belongsTo(Location, {
  as: "purchaseLocation",
  foreignKey: "purchaseLocationId",
});

// SIPL-ShipmentLocation (one 'SIPL' have one 'shipmentLocation')
SIPL.belongsTo(Location, {
  as: "shipmentLocation",
  foreignKey: "shipmentLocationId",
});

// (one PO have one Supplier) , (one Vendor as (Supplier) has many POs).
PurchaseOrder.belongsTo(Vendor, { foreignKey: "supplierId", as: "supplier" });
Vendor.hasMany(PurchaseOrder, { foreignKey: "supplierId", as: "purchaseOrder" });

// Ledger account belongs to one Vendor and one vendor has one ledger account.
LedgerAccount.belongsTo(Vendor, { foreignKey: "referenceId", as: "vendor", constraints: false });
Vendor.hasOne(LedgerAccount, { foreignKey: "referenceId", as: "ledgerAccount", constraints: false, scope: { referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.VENDOR } });

// Ledger account belongs to one Vendor and one vendor has one ledger account.
Customer.hasOne(LedgerAccount, { foreignKey: "referenceId", as: "ledgerAccount", constraints: false, scope: { referenceType: LEDGER_ACCOUNT_REFERENCE_TYPES.CUSTOMER } });

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
FreightDetail.belongsTo(Vendor, { foreignKey: "freightForwarderId", as: "freightForwarder" });
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

// Product-ProductSubCategory (one 'Product' have one 'SubCategory') (one 'SubCategory' have multiple 'Product')
Product.belongsTo(ProductSubCategory, { foreignKey: "subCategoryId", as: "subCategory" });
ProductSubCategory.hasMany(Product, { foreignKey: "subCategoryId" });

// Product-User (One 'Product' Belongs to one User) (One User can have multiple 'Products')
Product.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Product, { foreignKey: "createdBy" });

Product.belongsTo(User, { foreignKey: "updatedBy" });
User.hasMany(Product, { foreignKey: "updatedBy" });

// SIPL-SIPLProduct (one 'SIPLProduct' can have belongs to one 'SIPL') (one 'SIPL' have multiple 'SIPLProduct')
SIPL.hasMany(SIPLProduct, { foreignKey: "siplId", as: "siplProducts" });
SIPLProduct.belongsTo(SIPL, { foreignKey: "siplId", as: "sipl" });

// Product.hasMany(SIPLProduct, { foreignKey: "productId" });
// SIPLProduct.belongsTo(Product, { foreignKey: "productId", as: "product" });

// Slab-Product (one 'Slab' belongs to one 'Product') (one 'Product' can have multiple 'Slabs')
Slab.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Slab, { foreignKey: "productId" });

// Slab-SIPL (one 'Slab' belongs to one 'SIPL') (one 'SIPL' have multiple 'Slabs' )
Slab.belongsTo(SIPL, { foreignKey: "siplId", as: "sipl" });
SIPL.hasMany(Slab, { foreignKey: "siplId", as: "slabs" });

// Slab self-reference (parent-child relationship for broken slabs)
Slab.belongsTo(Slab, { foreignKey: "parentSlabId", as: "parentSlab" });
Slab.hasMany(Slab, { foreignKey: "parentSlabId", as: "childSlabs" });

// One Location has One Warehouse
Location.hasOne(Warehouse, { foreignKey: "locationId" });
Warehouse.belongsTo(Location, { foreignKey: "locationId", as: "location" });

// One Warehouse has Many Bins
Warehouse.hasMany(Bin, { foreignKey: "warehouseId" });
Bin.belongsTo(Warehouse, { foreignKey: "warehouseId" });

// one Bin has many slabs.
// Slab.belongsTo(Bin, { foreignKey: "binId" });
// Bin.hasMany(Slab, { foreignKey: "binId" });

// one Bin has many slabs.
// GenericProduct.belongsTo(Bin, { foreignKey: "binId" });
// Bin.hasMany(GenericProduct, { foreignKey: "binId" });

// one Bin has many slabs.
// Slab.belongsTo(Location, { foreignKey: "locationId" });
// Location.hasMany(Slab, { foreignKey: "locationId" });

// (one Vendor has many Bills) (One Bill belongs to one Ven)
Vendor.hasMany(Bill, { foreignKey: "vendorId", as: "bills" });
Bill.belongsTo(Vendor, { foreignKey: "vendorId", as: "vendor" });

// Bill have reference to SIPL
SIPL.hasMany(Bill, {
  foreignKey: "referenceId",
  constraints: false,
  scope: { referenceType: "sipl" },
  as: "bills",
});

Bill.belongsTo(SIPL, {
  foreignKey: "referenceId",
  constraints: false,
  as: "sipl",
});

// user have one default location ,One location could be default for many users.
User.belongsTo(Location, { foreignKey: "defaultLocationId" });
Location.hasMany(User, { foreignKey: "defaultLocationId" });

// User can have multiple bills
Bill.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(Bill, { foreignKey: "createdBy", as: "bills" });

// User can have multiple vendors (One vendor belongs to one User)
Vendor.belongsTo(User, { foreignKey: "createdBy", as: "user" });
User.hasMany(Vendor, { foreignKey: "createdBy", as: "vendors" });

// One Bin can have multiple products.
Bin.hasMany(InventoryProduct, { foreignKey: "binId" });
InventoryProduct.belongsTo(Bin, { foreignKey: "binId" });

// One product can have multiple inventory products.
Product.hasMany(InventoryProduct, { foreignKey: "productId", as: "inventoryProducts" });
InventoryProduct.belongsTo(Product, { foreignKey: "productId", as: 'product' });

// One sipl can have multiple inventory products.
SIPL.hasMany(InventoryProduct, { foreignKey: "siplId", as: "inventoryProducts" });
InventoryProduct.belongsTo(SIPL, { foreignKey: "siplId", as: 'sipl' });

// One to One relation.
Slab.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
InventoryProduct.hasOne(Slab, { foreignKey: "inventoryProductId" });

// One Ledger account have multiple transaction (one transaction belongs to one Account)
LedgerAccount.hasMany(JournalEntry, { foreignKey: "ledgerId", as: "transactions" });
JournalEntry.belongsTo(LedgerAccount, { foreignKey: "ledgerId", as: "ledgerAccount" });

SIPL.hasMany(JournalEntry, { foreignKey: "referenceId", as: "journalEntries", constraints: false });
JournalEntry.belongsTo(SIPL, { foreignKey: "referenceId", as: "sipl", constraints: false });

Slab.hasMany(JournalEntry, {
  foreignKey: "subReferenceId",
  constraints: false,
  scope: { subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.SLAB },
  as: "journalEntries",
});

JournalEntry.belongsTo(Slab, {
  foreignKey: "subReferenceId",
  constraints: false,
  as: "slab",
});

Product.hasMany(JournalEntry, {
  foreignKey: "subReferenceId",
  constraints: false,
  scope: { subReferenceType: JOURNAL_ENTRY_SUB_REFERENCE_TYPES.PRODUCT },
  as: "journalEntries",
});

JournalEntry.belongsTo(Product, {
  foreignKey: "subReferenceId",
  constraints: false,
  as: "product",
});

// User can create multiple customers (Customer can belongs to one User)
User.hasMany(Customer, { foreignKey: "createdBy", as: "customers" });
Customer.belongsTo(User, { foreignKey: "createdBy", as: "user" });

// SO-Account (one 'Account' have multiple 'SO') (one 'SO' have one 'Account')
Account.hasMany(SalesOrder, { foreignKey: "accountId", as: "salesOrders" });
SalesOrder.belongsTo(Account, { foreignKey: "accountId", as: "createdBy" });

// One Customer has Many SalesOrders, One SalesOrder belongs to One Customer
Customer.hasMany(SalesOrder, { foreignKey: "customerId" });
SalesOrder.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

// SalesOrder-InternalNote (A 'SalesOrder' has ONE 'Note' as internalNote)
SalesOrder.hasMany(Notes, {
  foreignKey: "referenceId",
  as: "notes",
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

// Loading Order can have one shipping address (Customer Address can used in many Loading Orders)
LoadingOrder.belongsTo(CustomerAddress, { foreignKey: "shippingAddressId", as: "shippingAddress" });
CustomerAddress.hasMany(LoadingOrder, { foreignKey: "shippingAddressId" });

SalesOrder.belongsTo(Location, { foreignKey: "soLocationId", as: "soLocation" });
Location.hasMany(SalesOrder, { foreignKey: "soLocationId", as: "salesOrders" });

// One Customer can have multiple addresses
CustomerAddress.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Customer.hasMany(CustomerAddress, { foreignKey: "customerId", as: "addresses" });

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

// SalesOrder have many SalesOrderProduct (one SalesOrderProduct belongs to one Sales Order)
SalesOrderProduct.belongsTo(SalesOrder, { foreignKey: "salesOrderId", as: "salesOrder" });
SalesOrder.hasMany(SalesOrderProduct, { foreignKey: "salesOrderId", as: "salesOrderProducts" });

// One sales Order belongs to inventory product.
SalesOrderProduct.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
InventoryProduct.hasMany(SalesOrderProduct, { foreignKey: "inventoryProductId", as: "salesOrderProducts" });

// One Payment belongs to one user (One user can have multiple payments)
Payment.belongsTo(User, { foreignKey: "userId", as: "createdBy" });
User.hasMany(Payment, { foreignKey: "userId", as: "payments" });

// One Payment belongs to one user (One user can have multiple payments)
Payment.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Payment, { foreignKey: "clientId", as: "payments" });

// One Payment belongs to one user (One user can have multiple payments)
Payment.belongsTo(Vendor, { foreignKey: "payeeId", as: "vendor", constraints: false });
Vendor.hasMany(Payment, { foreignKey: "payeeId", as: "payments", constraints: false });

// One Payment belongs to one user (One user can have multiple payments)
Payment.belongsTo(Customer, { foreignKey: "payeeId", as: "customer" });
Customer.hasMany(Payment, { foreignKey: "payeeId", as: "payments" });

Vendor.belongsTo(Location, { foreignKey: "parentLocationId", as: "parentLocation" });
Location.hasMany(Vendor, { foreignKey: "parentLocationId", as: "vendors" });

// SIPLProduct belongs to one RequestedPurchaseProduct (One RequestedPurchaseProduct can have one SIPLProducts)
SIPLProduct.belongsTo(RequestedPurchaseProduct, {
  foreignKey: "requestedPurchaseProductId",
  as: "requestedPurchaseProduct",
});

RequestedPurchaseProduct.hasMany(SIPLProduct, { foreignKey: "requestedPurchaseProductId", as: "siplProducts" });

// Slab belongs to one SIPLProduct (One SIPLProduct can have multiple Slabs)
Slab.belongsTo(SIPLProduct, { foreignKey: "siplProductId", as: "siplProduct" });
SIPLProduct.hasMany(Slab, { foreignKey: "siplProductId", as: "slabs" });

// Establish one-to-many relationship.
Slab.hasMany(SlabRemeasurement, { foreignKey: "slabId", as: "remeasurements" });
SlabRemeasurement.belongsTo(Slab, { foreignKey: "slabId", as: "slab" });

// 🔹 One Bill can have Many items.
Bill.hasMany(BillItem, { foreignKey: "billId", as: "billItems" });
BillItem.belongsTo(Bill, { foreignKey: "billId", as: "bill" });

// Many bill items could be created against one ledger account.
LedgerAccount.hasMany(BillItem, { foreignKey: "ledgerAccountId", as: "billItems" });
BillItem.belongsTo(LedgerAccount, { foreignKey: "ledgerAccountId", as: "ledgerAccount" });

// One SIPL can have multiple Container.
SIPL.hasMany(Container, { foreignKey: "siplId", as: "containers" });
Container.belongsTo(SIPL, { foreignKey: "siplId", as: "sipl" });

// Container belongs to Client
Container.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Container, { foreignKey: "clientId", as: "containers" });

Product.belongsTo(Bin, { foreignKey: "binId", as: "bin" });
Bin.hasMany(Product, { foreignKey: "binId", as: "products" });

// payment can have multiple bills and one bill can have multiple payments so this is an association table.
PaymentBill.belongsTo(Payment, { foreignKey: "paymentId", as: "payment" });
Payment.hasMany(PaymentBill, { foreignKey: "paymentId", as: "paymentBills" });

PaymentBill.belongsTo(SIPL, { foreignKey: "referenceId", as: "sipl", constraints: false, });
SIPL.hasMany(PaymentBill, { foreignKey: "referenceId", as: "paymentBills", constraints: false, scope: { referenceType: PAYMENT_BILL_REFERENCE_TYPES.SIPL } });

PaymentBill.belongsTo(Bill, { foreignKey: "referenceId", as: "bill", constraints: false, });
Bill.hasMany(PaymentBill, { foreignKey: "referenceId", as: "paymentBills", constraints: false, scope: { referenceType: PAYMENT_BILL_REFERENCE_TYPES.BILL } });

PaymentBill.belongsTo(SalesOrderInvoice, { foreignKey: "referenceId", as: "soInvoice", constraints: false, });
SalesOrderInvoice.hasMany(PaymentBill, { foreignKey: "referenceId", as: "paymentBills", constraints: false, scope: { referenceType: PAYMENT_BILL_REFERENCE_TYPES.SO_INVOICE } });

PaymentBill.belongsTo(AdvancedDeposit, { foreignKey: "referenceId", as: "advancedDeposit", constraints: false, });
AdvancedDeposit.hasOne(PaymentBill, { foreignKey: "referenceId", as: "paymentBill", constraints: false, scope: { referenceType: PAYMENT_BILL_REFERENCE_TYPES.ADVANCED_DEPOSIT } });

// AdvancedDepositSettlement associations
AdvancedDepositSettlement.belongsTo(SalesOrderInvoice, { foreignKey: "soInvoiceId", as: "soInvoice" });
SalesOrderInvoice.hasMany(AdvancedDepositSettlement, { foreignKey: "soInvoiceId", as: "advancedDepositSettlements" });

AdvancedDepositSettlement.belongsTo(AdvancedDeposit, { foreignKey: "advancedDepositId", as: "advancedDeposit" });
AdvancedDeposit.hasMany(AdvancedDepositSettlement, { foreignKey: "advancedDepositId", as: "settlements" });

// Loading order belongs to one SalesOrderProduct (one SalesOrderProduct can have one loadingOrderProduct)
LoadingOrderProduct.belongsTo(SalesOrderProduct, { foreignKey: "salesOrderProductId", as: "salesOrderProduct" });
SalesOrderProduct.hasOne(LoadingOrderProduct, { foreignKey: "salesOrderProductId", as: "loadingOrderProduct" });

// SalesOrderProduct belongs to one LoadingOrder (one LoadingOrder can have many SalesOrderProduct)
SalesOrderProduct.belongsTo(LoadingOrder, { foreignKey: "loadingOrderId", as: "loadingOrder" });
LoadingOrder.hasMany(SalesOrderProduct, { foreignKey: "loadingOrderId", as: "salesOrderProducts" });

// SalesOrderProduct belongs to one PackagingList (one PackagingList can have many SalesOrderProduct)
SalesOrderProduct.belongsTo(PackagingList, { foreignKey: "packagingListId", as: "packagingList" });
PackagingList.hasMany(SalesOrderProduct, { foreignKey: "packagingListId", as: "salesOrderProducts" });

// SalesOrderInvoice belongs to one Customer (one Customer can have many SalesOrderInvoice)
SalesOrderInvoice.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Customer.hasMany(SalesOrderInvoice, { foreignKey: "customerId", as: "salesOrderInvoices" });

// SalesOrderInvoice belongs to one SsalesOrder (one SalesOrder can have many SalesOrderInvoice)
SalesOrderInvoice.belongsTo(SalesOrder, { foreignKey: "salesOrderId", as: "salesOrder" });
SalesOrder.hasMany(SalesOrderInvoice, { foreignKey: "salesOrderId", as: "salesOrderInvoices" });

// SalesOrderInvoice belongs to one loadingOrder (one LoadingOrder can have one SalesOrderInvoice)
SalesOrderInvoice.belongsTo(LoadingOrder, { foreignKey: "loadingOrderId", as: "loadingOrder" });
LoadingOrder.hasOne(SalesOrderInvoice, { foreignKey: "loadingOrderId", as: "salesOrderInvoice" });

// SalesOrderInvoice belongs to one Client (one Client can have many SalesOrderInvoice)
SalesOrderInvoice.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(SalesOrderInvoice, { foreignKey: "clientId", as: "salesOrderInvoices" });

// Truck belongs to One Client (One Client can have many Trucks)
Truck.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Truck, { foreignKey: "clientId", as: "trucks" });

JournalEntry.belongsTo(User, { foreignKey: "createdBy", as: "user" });
User.hasMany(JournalEntry, { foreignKey: "createdBy", as: "journalEntries" });

ProductGroup.belongsTo(User, { foreignKey: "createdBy", as: "createdByUser" });
User.hasMany(ProductGroup, { foreignKey: "createdBy", as: "productGroups" });

Product.belongsTo(ProductGroup, { foreignKey: "groupId", as: "group" });
ProductGroup.hasMany(Product, { foreignKey: "groupId", as: "products" });

Product.belongsTo(ProductFinish, { foreignKey: "finishId", as: "finish" });
ProductFinish.hasMany(Product, { foreignKey: "finishId", as: "products" });

Product.belongsTo(ProductBaseColor, { foreignKey: "baseColorId", as: "baseColor" });
ProductBaseColor.hasMany(Product, { foreignKey: "baseColorId", as: "products" });

// Product finish belongs to one User (One user can have multiple product finishes)
ProductFinish.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(ProductFinish, { foreignKey: "createdBy", as: "productFinishes" });

ProductBaseColor.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(ProductBaseColor, { foreignKey: "createdBy", as: "productBaseColors" });

JournalEntry.belongsTo(Location, { foreignKey: "locationId", as: "location" });
Location.hasMany(JournalEntry, { foreignKey: "locationId", as: "journalEntries" });

JournalEntry.belongsTo(LedgerAccount, { foreignKey: "partyLedgerAccountId", as: "partyLedgerAccount" });

SalesOrderInvoice.belongsTo(Truck, { foreignKey: "truckId", as: "truck" });
Truck.hasMany(SalesOrderInvoice, { foreignKey: "truckId", as: "salesOrderInvoices" });

// Product belongs to one LedgerAccount (one LedgerAccount can have multiple products)
Product.belongsTo(LedgerAccount, { foreignKey: "inventoryLinkAccountId", as: "inventoryLinkAccount" });

// Product belongs to one LedgerAccount (one LedgerAccount can have multiple products)
Product.belongsTo(LedgerAccount, { foreignKey: "incomeAccountId", as: "incomeAccount" });

// Product belongs to one LedgerAccount (one LedgerAccount can have multiple products)
Product.belongsTo(LedgerAccount, { foreignKey: "costOfGoodsAccountId", as: "costOfGoodsAccount" });

// Define the association
Customer.belongsTo(User, {
  foreignKey: "primarySalesPersonId",
  as: "primarySalesPerson",
});

User.hasMany(Customer, {
  foreignKey: "primarySalesPersonId",
  as: "primarySalesCustomers",
});

Customer.hasOne(CustomerAddress, { foreignKey: 'customerId', as: 'billingAddress', scope: { addressType: CUSTOMER_ADDRESS_TYPES.REMIT } })

// Associations
AdvancedDeposit.belongsTo(SalesOrder, { foreignKey: "salesOrderId", as: 'salesOrder' });
SalesOrder.hasMany(AdvancedDeposit, { foreignKey: "salesOrderId", as: 'advancedDeposits' });

// Return associations
Return.hasMany(ReturnProduct, {
  foreignKey: "returnId",
  as: "returnProducts",
});

ReturnProduct.belongsTo(Return, {
  foreignKey: "returnId",
  as: "return",
});

ReturnProduct.belongsTo(SalesOrderProduct, {
  foreignKey: "salesOrderProductId",
  as: "salesOrderProduct",
});

SalesOrderProduct.hasMany(ReturnProduct, {
  foreignKey: "salesOrderProductId",
  as: "returnProduct",
});

SalesOrderProduct.hasMany(ReturnProduct, {
  foreignKey: "salesOrderProductId",
  as: "returnProducts",
});

// Return associations
SalesOrderInvoice.hasMany(Return, {
  foreignKey: "invoiceId",
  as: "returns",
});

// Return associations
Return.belongsTo(SalesOrderInvoice, {
  foreignKey: "invoiceId",
  as: "soInvoice",
});

// one truck can have multiple deliveries, one delivery can one truck.
Delivery.belongsTo(Truck, { foreignKey: "truckId", as: "truck" });
Truck.hasMany(Delivery, { foreignKey: "truckId", as: "deliveries" });

// one loading order can have multiple invoice deliveries, one invoice delivery belongs to one loading order
InvoiceDelivery.belongsTo(LoadingOrder, { foreignKey: "loadingOrderId", as: "loadingOrder" });
LoadingOrder.hasMany(InvoiceDelivery, { foreignKey: "loadingOrderId", as: "invoiceDeliveries" });

// one delivery can have multiple invoice deliveries, one invoice delivery belongs to one delivery
InvoiceDelivery.belongsTo(Delivery, { foreignKey: "deliveryId", as: "delivery" });
Delivery.hasMany(InvoiceDelivery, { foreignKey: "deliveryId", as: "invoiceDeliveries" });

// ServiceCategory-Client relation (many ServiceCategory to one Client)
ServiceCategory.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(ServiceCategory, { foreignKey: "clientId", as: "serviceCategories" });

// Service-ServiceCategory relation (many Service to one ServiceCategory)
Service.belongsTo(ServiceCategory, { foreignKey: "serviceCategoryId", as: "serviceCategory" });
ServiceCategory.hasMany(Service, { foreignKey: "serviceCategoryId", as: "services" });

// Service-LedgerAccount relation (many Service to one LedgerAccount)
Service.belongsTo(LedgerAccount, { foreignKey: "ledgerAccountId", as: "ledgerAccount" });
LedgerAccount.hasMany(Service, { foreignKey: "ledgerAccountId", as: "services" });

TradeService.belongsTo(Service, { foreignKey: "serviceId", as: 'service' })

// Register associations for GenericProduct
GenericProduct.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
GenericProduct.belongsTo(User, { foreignKey: "updatedById", as: "updatedBy" });
GenericProduct.belongsTo(Product, { foreignKey: "productId", as: "product" });
GenericProduct.belongsTo(SIPL, { foreignKey: "siplId", as: "sipl" });
GenericProduct.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
GenericProduct.belongsTo(SIPLProduct, { foreignKey: "siplProductId", as: "siplProduct" });

SIPLProduct.hasMany(GenericProduct, { foreignKey: "siplProductId", as: "genericProducts" });

SIPL.hasMany(GenericProduct, { foreignKey: "siplId", as: "genericProducts" });

InventoryProduct.hasOne(GenericProduct, { foreignKey: "inventoryProductId", as: "genericProduct" });

Product.hasMany(GenericProduct, { foreignKey: "productId", as: "genericProducts" });

AdvancedDeposit.belongsTo(LedgerAccount, { foreignKey: 'accountId', as: 'ledgerAccount' })
LedgerAccount.hasMany(AdvancedDeposit, { foreignKey: 'accountId', as: 'advancedDeposits' })

AdvancedDeposit.hasOne(Payment, { foreignKey: 'paymentForId', as: 'payment' })

// CreditDebitNote associations
CreditDebitNote.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(CreditDebitNote, { foreignKey: "clientId", as: "creditDebitNotes" });

// SoProductSwapHistory associations
SoProductSwapHistory.belongsTo(SalesOrderProduct, { foreignKey: "salesProductId", as: "salesOrderProduct" });
SalesOrderProduct.hasMany(SoProductSwapHistory, { foreignKey: "salesProductId", as: "swapHistories" });

SoProductSwapHistory.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
InventoryProduct.hasMany(SoProductSwapHistory, { foreignKey: "inventoryProductId", as: "swapHistories" });

// InventoryProductHold associations
InventoryProductHold.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
InventoryProduct.hasOne(InventoryProductHold, { foreignKey: "inventoryProductId", as: "hold" });

InventoryProductHold.belongsTo(Account, { foreignKey: "createdById", as: "createdBy" });
Account.hasMany(InventoryProductHold, { foreignKey: "createdById", as: "inventoryProductHolds" });

InventoryProductHold.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Customer.hasMany(InventoryProductHold, { foreignKey: "customerId", as: "inventoryProductHolds" });

// SelectionSheet associations
SelectionSheet.belongsTo(Account, { foreignKey: "createdById", as: "createdBy" });
Account.hasMany(SelectionSheet, { foreignKey: "createdById", as: "selectionSheets" });

SelectionSheet.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });
Customer.hasMany(SelectionSheet, { foreignKey: "customerId", as: "selectionSheets" });

SelectionSheet.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(SelectionSheet, { foreignKey: "clientId", as: "selectionSheets" });

SelectionSheet.hasMany(SelectionSheetItem, { foreignKey: "selectionSheetId", as: "items" });

// SelectionSheetItem associations
SelectionSheetItem.belongsTo(SelectionSheet, { foreignKey: "selectionSheetId", as: "selectionSheet" });

SelectionSheetItem.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
InventoryProduct.hasMany(SelectionSheetItem, { foreignKey: "inventoryProductId", as: "selectionSheetItems" });

SelectionSheetItem.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(SelectionSheetItem, { foreignKey: "clientId", as: "selectionSheetItems" });

LoadingOrder.hasMany(TradeService, { foreignKey: "referenceId", as: "tradeServices", constraints: false, scope: { referenceType: TRADE_SERVICE_REFERENCE_TYPES.LOADING_ORDER } })
TradeService.belongsTo(LoadingOrder, { foreignKey: "referenceId", as: "loadingOrder", constraints: false, scope: { referenceType: TRADE_SERVICE_REFERENCE_TYPES.LOADING_ORDER } });

SIPL.hasMany(TradeService, { foreignKey: "referenceId", as: "tradeServices", constraints: false, scope: { referenceType: TRADE_SERVICE_REFERENCE_TYPES.SIPL } })
TradeService.belongsTo(SIPL, { foreignKey: "referenceId", as: "sipl", constraints: false, scope: { referenceType: TRADE_SERVICE_REFERENCE_TYPES.SIPL } });

// Client-TermsCondition relation (one-to-one: one Client has one TermsCondition)
Client.hasOne(TermsCondition, { foreignKey: "clientId", as: "termsCondition" });
TermsCondition.belongsTo(Client, { foreignKey: "clientId", as: "client" });

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
  ProductSubCategory,
  InventoryProduct,
  LedgerAccount,
  JournalEntry,
  Customer,
  CustomerAddress,
  LoadingOrder,
  LoadingOrderProduct,
  PackagingList,
  SalesOrder,
  SalesOrderProduct,
  Payment,
  SlabRemeasurement,
  BillItem,
  Container,
  PaymentBill,
  SalesOrderInvoice,
  Truck,
  ProductGroup,
  ProductBaseColor,
  ProductFinish,
  Account,
  Company,
  AdvancedDeposit,
  AdvancedDepositSettlement,
  Return,
  ReturnProduct,
  Delivery,
  InvoiceDelivery,
  ServiceCategory,
  Service,
  TradeService,
  GenericProduct,
  CreditDebitNote,
  CartItem,
  SoProductSwapHistory,
  InventoryProductHold,
  SelectionSheet,
  SelectionSheetItem,
  AccountPermission,
  TermsCondition
};
