import * as model from "../models/index.js";

// update product Inventory

export async function updateProductInventory(data) {
  try {
    const result = await model.productInventoryModel.update(data, {
      where: {
        productId: data.productId,
      },
    });
    return result;
  } catch (error) {
    console.error("Error in updating product Inventory:", error);
    throw error;
  }
}

// get product detail in product inventory

export async function getProductDetailsOfProductInventory(productId) {
  try {
    const result = await model.productInventoryModel.findOne({
      attributes: ["slabInStock", "quantityInStock"],
      where: {
        productId: productId,
      },
    });
    return result;
  } catch (error) {
    console.error(
      `Error in getting product details during receving Inventory ${productId}:`,
      error
    );
    throw error;
  }
}

export async function addProductInventory(data) {
  try {
    const result = await model.productInventoryModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add Product Inventory:", error);
    throw error;
  }
}

export async function addInventoryInvoice(data) {
  try {
    const result = await model.inventoryInvoiceMapper.create(data);
    return result;
  } catch (error) {
    console.error("Error in add Inventory Invoice:", error);
    throw error;
  }
}

export async function getInventoryDetailsBySupplierInvoiceMapperId(poSupplierInvoiceMappperId) {
  try {
    const res = await model.poSupplierInvoiceMapperModel.findOne({
      attributes: ["purchase_order_id"],
      include: [
        {
          model: model.poSupplierInvoiceModel,
          as: "supplierInvoice",
          attributes: ["slab", "quantity", "po_supplier_invoice_id"],
          include: [
            {
              model: model.poSlabDetails,
              as: "slabDetails",
              attributes: ["po_slab_detail_id"],
            },
            {
              model: model.purchaseProductModel,
              as: "supplierPurchaseProduct",
              attributes: ["product_id"],
            },
          ],
        },
      ],
      where: {
        poSupplierInvoiceMappperId: poSupplierInvoiceMappperId,
      },
    });
    return res;
  } catch (error) {
    console.error(
      "Error in getInventoryDetailsBySupplierInvoiceMapperId:",
      error
    );
    throw error;
  }
}

export async function getInventoryList() {
  try {
    const result = await model.productInventoryModel.findAll({
      include: [
        {
          model: model.inventoryInvoiceMapper,
          as: "productInventoryInvoiceMapper",
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
          include: [
            {
              model: model.poSupplierInvoiceModel,
              as: "productInventoryInvoice",
              attributes: {
                exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
              },
              include: [
                {
                  model: model.poSlabDetails,
                  as: "slabDetails",
                  attributes: {exclude: ["createdAt", "updatedAt", "deletedAt", "status"]},
                },
                {
                  model: model.purchaseProductModel,
                  as: "supplierPurchaseProduct",
                  attributes: {
                    exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
                  },
                  include: [
                    {
                      model: model.productModel,
                      as: "products",
                      attributes: {exclude: ["createdAt", "updatedAt", "deletedAt", "status"]},
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Error in getInventoryList:", error);
    throw error;
  }
}

// after sales_orders_inventory table sale status change to Invoice then It become Inactive

export async function updateProductInventoryInactive(productInventoryId, data) {
  try {
      const result = await model.productInventoryModel.update(data, {
          where: {
            productInventoryId: productInventoryId
          }
      });
   return result; 
  } catch (error) {
      console.error("Error updating product Inventory INACTIVE:", error);
      throw error; 
  }
}