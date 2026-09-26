import { Op } from "sequelize";
import _ from "lodash";
import * as models from "../models";
import { scoped } from "../utils/scoped";

/**
 * Fetch products and their inventory items for the Inventory Summary report.
 */
export const getInventorySummary = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  // If limit is -1, it means fetch all (for download)
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  // Build inventory condition if location filter is present
  const inventoryWhere: any = {};
  if (locationId) {
    inventoryWhere.locationId = Number(locationId);
  }

  // We only fetch products that have at least one inventory product
  // Or maybe we want to show all active slab products? Usually, a report shows items with inventory.
  // The requirements say "Current inventory by product". Let's show all slab products that have inventory.
  
  const queryOptions: any = {
    where: {
      clientId,
      // isSlabType: true, // If we want only slabs. The image says "Total Slabs", "Total SF", so it implies slabs.
      // We will leave it open for now, or filter if needed.
    },
    include: [
      { association: "group", attributes: ["name"] },
      { association: "subCategory", attributes: ["name"] },
      { association: "baseColor", attributes: ["name"] },
      { association: "finish", attributes: ["name"] },
      {
        association: "inventoryProducts",
        where: Object.keys(inventoryWhere).length > 0 ? inventoryWhere : undefined,
        required: true, // Only include products with inventory
        include: [
          { association: "slab", attributes: ["receivingLength", "receivingWidth"] },
          { association: "genericProduct", attributes: ["isHold"] },
          { association: "holdItem", attributes: ["id"] },
          { association: "location", attributes: ["locationName"] },
        ],
      },
    ],
    distinct: true, // Needed because of hasMany join to count properly
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Product).findAndCountAll(queryOptions);

  return {
    products: rows,
    total: count,
    page,
    limit,
  };
};

export const getSlabInventoryDetail = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId, isSlabType: true };
  if (locationId) {
    where.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where,
    include: [
      {
        association: "product",
        include: [
          { association: "group", attributes: ["name"] },
          { association: "subCategory", attributes: ["name"] },
          { association: "baseColor", attributes: ["name"] },
          { association: "finish", attributes: ["name"] },
        ]
      },
      { 
        association: "slab", 
        attributes: ["slabNumber", "serialNumber", "receivingLength", "receivingWidth", "block", "lot"] 
      },
      { association: "location", attributes: ["locationName"] },
      { association: "sipl", attributes: ["invoiceCode"] },
      { 
        association: "holdItem", 
        include: [
          {
            association: "hold",
            include: [
              { association: "customer", attributes: ["name"] }
            ]
          }
        ]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.InventoryProduct).findAndCountAll(queryOptions);

  return {
    slabs: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getHeldInventoryReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  // We are fetching InventoryProductHold to flatten the report by slab
  const where: any = { clientId };

  const queryOptions: any = {
    where,
    include: [
      {
        association: "hold",
        attributes: ["id", "clientHoldNumber", "createdAt", "expiresAt", "stage"],
        include: [
          { association: "customer", attributes: ["name"] },
          { association: "createdBy", attributes: ["name"] }
        ]
      },
      {
        association: "inventoryProduct",
        required: true,
        where: locationId ? { locationId: Number(locationId) } : undefined,
        include: [
          {
            association: "product",
            attributes: ["name"]
          },
          {
            association: "slab",
            attributes: ["slabNumber", "serialNumber", "block", "receivingLength", "receivingWidth"]
          },
          {
            association: "location",
            attributes: ["locationName"]
          }
        ]
      }
    ]
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.InventoryProductHold).findAndCountAll(queryOptions);

  return {
    heldItems: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getSalesOrderRegisterReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId };
  if (locationId) {
    where.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where,
    include: [
      { association: "customer", attributes: ["name"] },
      { association: "createdBy", attributes: ["name"] },
      { association: "soLocation", attributes: ["locationName"] },
      {
        association: "quotation",
        include: [{ association: "opportunity", attributes: ["clientOpportunityNumber"] }]
      },
      {
        association: "salesOrderProducts",
        include: [
          {
            association: "inventoryProduct",
            attributes: ["landedUnitCost"]
          }
        ]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.SalesOrder).findAndCountAll(queryOptions);

  return {
    salesOrders: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getSlabSalesDetailReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId, isSlabType: true };

  const queryOptions: any = {
    where,
    include: [
      {
        association: "salesOrder",
        required: true,
        where: locationId ? { locationId: Number(locationId) } : undefined,
        include: [
          { association: "customer", attributes: ["name"] },
          { association: "createdBy", attributes: ["name"] },
          { association: "salesOrderInvoices", attributes: ["clientSoInvoiceNumber", "invoiceCode"] }
        ]
      },
      {
        association: "inventoryProduct",
        include: [
          { association: "product", attributes: ["name"] },
          { association: "slab", attributes: ["block", "slabNumber", "serialNumber"] }
        ]
      },
      { association: "location", attributes: ["locationName"] }
    ]
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.SalesOrderProduct).findAndCountAll(queryOptions);

  return {
    salesProducts: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getSalesByCustomerReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const soWhere: any = {};
  if (locationId) {
    soWhere.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where: { clientId },
    include: [
      {
        association: "salesOrders",
        where: soWhere,
        required: true,
        include: [
          {
            association: "salesOrderProducts",
            include: [
              {
                association: "inventoryProduct",
                attributes: ["landedUnitCost"]
              }
            ]
          }
        ]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Customer).findAndCountAll(queryOptions);

  return {
    customers: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getSalesByProductReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const soWhere: any = {};
  if (locationId) {
    soWhere.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where: { clientId },
    include: [
      { association: "group", attributes: ["name"] },
      { association: "subCategory", attributes: ["name"] },
      { association: "baseColor", attributes: ["name"] },
      { association: "finish", attributes: ["name"] },
      {
        association: "inventoryProducts",
        required: true,
        include: [
          {
            association: "salesOrderProducts",
            required: true,
            where: soWhere,
          }
        ]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Product).findAndCountAll(queryOptions);

  return {
    products: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getSalesProfitabilityReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId };

  const queryOptions: any = {
    where,
    include: [
      {
        association: "salesOrder",
        required: true,
        where: locationId ? { locationId: Number(locationId) } : undefined,
        include: [
          { association: "customer", attributes: ["name"] },
          { association: "createdBy", attributes: ["name"] },
          { association: "salesOrderInvoices", attributes: ["clientSoInvoiceNumber", "invoiceCode"] }
        ]
      },
      {
        association: "inventoryProduct",
        include: [
          { association: "product", attributes: ["name"] }
        ]
      },
      { association: "location", attributes: ["locationName"] }
    ]
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.SalesOrderProduct).findAndCountAll(queryOptions);

  return {
    salesProducts: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getPurchaseOrderRegisterReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId };
  if (locationId) {
    where.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where,
    include: [
      { association: "supplier", attributes: ["name"] },
      { association: "purchaseLocation", attributes: ["locationName"] },
      { association: "user", attributes: ["name"] }, // Created by -> User belongs to PO as userId? Let's check associations. Wait, User is just associated.
      {
        association: "requestedPurchaseProducts",
        include: [{ association: "product", attributes: ["name", "isSlabType"] }]
      },
      {
        association: "sipls",
        attributes: ["id", "inventoryReceived"],
        include: [
          {
            association: "siplProducts",
            attributes: ["id", "quantity", "noOfSlabs", "unitPrice"],
            include: [
              { association: "slabs", attributes: ["receivingLength", "receivingWidth"] }
            ]
          }
        ]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.PurchaseOrder).findAndCountAll(queryOptions);

  return {
    purchaseOrders: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getPurchaseDetailReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  // We only care about inventory that came from a SIPL/PO (has siplId)
  const where: any = { clientId, siplId: { [Op.ne]: null } };
  if (locationId) {
    where.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where,
    include: [
      {
        association: "sipl",
        attributes: ["id", "poSiplNumber", "invoiceCode", "supplierInvoiceNumber"],
        include: [
          {
            association: "purchaseOrder",
            attributes: ["id", "clientPoNumber", "poDate"],
            include: [{ association: "supplier", attributes: ["name"] }]
          }
        ]
      },
      {
        association: "product",
        include: [
          { association: "group", attributes: ["name"] },
          { association: "subCategory", attributes: ["name"] },
          { association: "finish", attributes: ["name"] },
        ]
      },
      {
        association: "slab",
        attributes: ["block", "slabNumber", "serialNumber", "receivingLength", "receivingWidth"]
      },
      {
        association: "location",
        attributes: ["locationName"]
      }
    ]
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.InventoryProduct).findAndCountAll(queryOptions);

  return {
    purchaseDetails: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getPurchasesBySupplierReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId };

  const queryOptions: any = {
    where,
    include: [
      {
        association: "purchaseOrder",
        required: true,
        where: locationId ? { locationId: Number(locationId) } : undefined,
        include: [
          {
            association: "requestedPurchaseProducts",
            include: [{ association: "product", attributes: ["name", "isSlabType"] }]
          },
          {
            association: "sipls",
            attributes: ["id", "inventoryReceived"],
            include: [
              {
                association: "inventoryProducts",
                attributes: ["id", "FOBcost", "landedUnitCost", "isSlabType"],
                include: [
                  { association: "slab", attributes: ["receivingLength", "receivingWidth"] }
                ]
              }
            ]
          }
        ]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Vendor).findAndCountAll(queryOptions);

  return {
    vendors: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getInvoiceRegisterReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId };
  if (locationId) {
    where.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where,
    include: [
      { association: "customer", attributes: ["name"] },
      { 
        association: "salesOrder", 
        attributes: ["clientSoNumber", "customerPoNumber", "paymentTermId", "soDate"]
      },
      { association: "location", attributes: ["locationName"] },
      { 
        association: "paymentBills",
        attributes: ["amount"]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.SalesOrderInvoice).findAndCountAll(queryOptions);

  return {
    invoices: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getArAgeingReport = async (
  clientId: number,
  locationId?: number
) => {
  const where: any = { clientId };
  if (locationId) {
    where.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where,
    include: [
      { association: "customer", attributes: ["name"] },
      { 
        association: "salesOrder", 
        attributes: ["clientSoNumber", "customerPoNumber", "paymentTermId", "soDate"]
      },
      { association: "location", attributes: ["locationName"] },
      { 
        association: "paymentBills",
        attributes: ["amount"]
      }
    ],
    distinct: true,
  };

  const { rows, count } = await scoped(models.SalesOrderInvoice).findAndCountAll(queryOptions);

  return {
    invoices: rows,
    total: count,
  };
};

export const getPaymentReport = async (
  clientId: number,
  page: number,
  limit: number,
  locationId?: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  // incoming payments from CUSTOMER only
  const where: any = { clientId, paymentType: 'incoming', payeeType: 'customer' };
  if (locationId) {
    where.locationId = Number(locationId);
  }

  const queryOptions: any = {
    where,
    include: [
      { association: "customer", attributes: ["name"] },
      { association: "location", attributes: ["locationName"] },
      { association: "createdBy", attributes: ["name"] },
      { 
        association: "paymentBills",
        include: [
          {
            association: "soInvoice",
            attributes: ["invoiceCode", "clientSoInvoiceNumber"],
            include: [{ association: "salesOrder", attributes: ["clientSoNumber"] }]
          }
        ]
      }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Payment).findAndCountAll(queryOptions);

  return {
    payments: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getCustomerMasterReport = async (
  clientId: number,
  page: number,
  limit: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId };

  const queryOptions: any = {
    where,
    include: [
      { association: "billingAddress" },
      { association: "primarySalesPerson", attributes: ["name"] }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Customer).findAndCountAll(queryOptions);

  return {
    customers: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getSupplierMasterReport = async (
  clientId: number,
  page: number,
  limit: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId, type: 'SUPPLIER' };

  const queryOptions: any = {
    where,
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Vendor).findAndCountAll(queryOptions);

  return {
    suppliers: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};

export const getFabricatorMasterReport = async (
  clientId: number,
  page: number,
  limit: number
) => {
  const isDownload = limit === -1;
  const offset = isDownload ? undefined : (page - 1) * limit;

  const where: any = { clientId, type: 'fabricator' };

  const queryOptions: any = {
    where,
    include: [
      { association: "billingAddress" }
    ],
    distinct: true,
  };

  if (!isDownload) {
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  const { rows, count } = await scoped(models.Customer).findAndCountAll(queryOptions);

  return {
    fabricators: rows,
    total: count,
    page: isDownload ? 1 : page,
    limit: isDownload ? count : limit,
  };
};
