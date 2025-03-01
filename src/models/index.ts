import Bill from "./bill";
import Bin from "./bin";
import Client from "./client";
import FreightDetail from "./freightDetail";
import Location from "./location";
import Notes from "./note";
import Product from "./product";
import ProductCategory from "./productCategory";
import PurchaseOrder from "./purchaseOrder";
import RequestedPurchaseProduct from "./requestedPurchaseProduct";
import SIPL from "./sipl";
import SIPLProduct from "./siplProduct";
import Slab from "./slab";
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
PurchaseOrder.hasOne(Notes, {
  foreignKey: "referenceId",
  constraints: false,
  scope: { referenceType: "PurchaseOrder" },
  as: "internalNote",
});

Notes.belongsTo(PurchaseOrder, {
  foreignKey: "referenceId",
  constraints: false,
  as: "purchaseOrder",
});

// PurchaseOrder-PrintableNote (A 'PurchaseOrder' has ONE 'Note' as printableNote)
PurchaseOrder.hasOne(Notes, {
  foreignKey: "referenceId",
  constraints: false,
  scope: { referenceType: "PurchaseOrder" },
  as: "printableNote",
});

Notes.belongsTo(PurchaseOrder, {
  foreignKey: "referenceId",
  constraints: false,
  as: "purchaseOrderPrintable",
});

// Vender-Notes (one vendor can have one internal note)
Vendor.hasOne(Notes, {
  foreignKey: "referenceId",
  constraints: false,
  scope: {
    referenceType: "Vendor",
  },
});

Notes.belongsTo(Vendor, {
  foreignKey: "referenceId",
  constraints: false,
});

// Vender-Notes (one vendor can have one internal note)
Bill.hasOne(Notes, {
  foreignKey: "referenceId",
  constraints: false,
  scope: {
    referenceType: "Bill",
  },
});

Notes.belongsTo(Bill, {
  foreignKey: "referenceId",
  constraints: false,
});

// PurchaseOrder-SIPL (one 'PurchaseOrder' have multiple 'SIPL') (one 'SIPL' have one 'PurchaseOrder')
SIPL.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
PurchaseOrder.hasMany(SIPL, { foreignKey: "purchaseOrderId", as: "sipls" });

// SIPL-User (SIPL have one 'User' as createdBy) (SIPL have one 'User' as updatedBy)
SIPL.belongsTo(User, { foreignKey: "createdBy" });
SIPL.belongsTo(User, { foreignKey: "updatedBy" });

// FreightDetail optionally belongs to a SIPL
FreightDetail.belongsTo(SIPL, { foreignKey: "siplId" });
SIPL.hasOne(FreightDetail, { foreignKey: "siplId" });

// FreightDetail-PurchaseOrder ('FreightDetail' have one 'PurchaseOrder')
FreightDetail.belongsTo(PurchaseOrder, { foreignKey: "purchaseOrderId" });
PurchaseOrder.hasOne(FreightDetail, { foreignKey: "purchaseOrderId" });

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

// Product-User (One 'Product' Belongs to one User) (One User can have multiple 'Products')
Product.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Product, { foreignKey: "createdBy" });

Product.belongsTo(User, { foreignKey: "updatedBy" });
User.hasMany(Product, { foreignKey: "updatedBy" });

// SIPL-SIPLProduct (one 'SIPLProduct' can have belongs to one 'SIPL') (one 'SIPL' have multiple 'SIPLProduct')
SIPL.hasMany(SIPLProduct, { foreignKey: "siplId", as: "siplProducts" });
SIPLProduct.belongsTo(SIPL, { foreignKey: "siplId" });

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
};
