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
import inventoryInvoiceMapper from './inventoryInvoiceMapper.js'

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


export {
	productModel,userModel,supplierModel,settingModel,purchaseModel,prePurchaseModel,purchaseProductModel,locationModel,poSupplierInvoiceModel,poSupplierInvoiceMapperModel,poSlabDetails,productInventoryModel,inventoryInvoiceMapper
}