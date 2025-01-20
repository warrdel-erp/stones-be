import { PaginatedData } from "../helpers/paginatedData.js";
import * as model from "../models/index.js";
import { Op, Sequelize } from "sequelize";
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
      attributes: ["slabInStock", "quantityInStock", "productInventoryId"],
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
    const productinventory = await model.inventoryInvoiceMapper.findOne({
      where: data,
    });
    if (!productinventory) {
      const result = await model.inventoryInvoiceMapper.create(data);
      return result;
    }
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

export async function getInventoryList(page, limit, clientId) {
  try {
    const offset = page * limit;
    console.log(`Fetching inventory with limit: ${limit}, offset: ${offset}`);

    const result = await model.productInventoryModel.findAll({
      where: {
        status: 'ACTIVE'
      },
      // offset: offset,
      // limit: limit,
      include: [
        {
          model: model.clientUserModel,
          as: 'clientDetails',
          attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
          where: {
            clientId: clientId
          }
        },
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
                  model: model.poSupplierInvoiceMapperModel,
                  attributes: {
                    exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
                  },
                  as: 'transactionData',
                },
                {
                  model: model.poSlabDetails,
                  as: "slabDetails",
                  where: {
                    status: {
                      [Op.in]: ['ACTIVE', 'RETURNED', 'ONHOLD']
                    }
                  },
                  attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
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
                      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "status"] },
                    },
                  ],
                },
              ],
            },
          ],

        },
      ],
    });
    console.log(`Fetched getInventoryList ${result.length} records`);
    return result;
  } catch (error) {
    console.error("Error in getInventoryList:", error);
    throw error;
  }
}

export async function getInventoryListBasedOnSipl(clientId, locationId, limit, page) {
  try {
    const offset = (page - 1) * limit;

    const landedCosts = await model.landedCostModel.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('AVG', Sequelize.col('product_landed_cost_id')), 'averageLandedCost'],
        [Sequelize.fn('MAX', Sequelize.col('created_at')), 'lastUpdatedAt'],
        [Sequelize.fn('SUM', Sequelize.col('product_landed_cost')), 'totalLandedCost'],
        [Sequelize.fn('COUNT', Sequelize.col('product_Id')), 'productCount'],
        [Sequelize.literal('SUM(product_landed_cost) / COUNT(product_Id)'), 'finalAverageLandedCost']
      ],
      group: ['productId'],
      raw: true,
    });

    const lastLandedCosts = await model.landedCostModel.findAll({
      attributes: [
        'productId',
        'productLandedCost',
      ],
      where: {
        createdAt: {
          [Op.eq]: Sequelize.literal("(SELECT MAX(`created_at`) FROM `product_landed_cost` WHERE `product_id` = `product_landed_cost`.`product_id`)")
        }
      },
      raw: true,
    });

    const landedCostMap = Object.fromEntries(
      landedCosts.map(cost => [cost.productId, {
        averageLandedCost: cost.averageLandedCost,
        lastLandedCost: cost.lastLandedCost,
        totalLandedCost: cost.totalLandedCost,
        productCount: cost.productCount,
        finalAverageLandedCost: cost.finalAverageLandedCost,
      }])
    );

    const lastCostMap = Object.fromEntries(
      lastLandedCosts.map(cost => [cost.productId, cost.productLandedCost])
    );

    const result = await model.productInventoryModel.findAndCountAll({
      where: {
        status: 'ACTIVE'
      },
      attributes: ["slabInStock", "quantityInStock", "slabAvailable", "quantityAvailable"],
      include: [
        {
          model: model.inventoryInvoiceMapper,
          as: "productInventoryInvoiceMapper",
          attributes: ["inventoryInvoiceMapperId", "poSupplierInvoiceId"],
          required: true,
          include: [
            {
              model: model.poSupplierInvoiceModel,
              as: "productInventoryInvoice",
              attributes: ["poSupplierInvoiceId"],
              required: true,
              include: [
                {
                  model: model.poSlabDetails,
                  as: "slabDetails",
                  where: {
                    status: {
                      [Op.in]: ['ACTIVE', 'RETURNED', 'ONHOLD']
                    },
                    locationId
                  },
                  required: true,
                  include: [
                    {
                      model: model.locationModel,
                      // as: 'slabLocation'
                    }
                  ],
                  attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
                },
                {
                  model: model.poSupplierInvoiceMapperModel,
                  as: "transactionData",
                  attributes: {
                    exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
                  }
                }
              ]
            },
          ],
        },
        {
          model: model.productModel,
          as: "salesProductDetails",
          attributes: ["productId", "productName", "type", "baseColor", "origin", "kind", "category", "groupsAll"],
        },
        {
          model: model.clientUserModel,
          as: 'clientDetails',
          attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
          where: {
            clientId: clientId
          },
        }
      ],
      offset,
      limit,
      subQuery: false,
      distinct: true
    });

    // convert to paginated response.
    const paginatedData = PaginatedData(result, limit, page)

    const enrichedResult = paginatedData.data.map(entry => {
      const productId = entry.salesProductDetails.productId;
      const landedCostInfo = landedCostMap[productId] || {};

      return {
        ...entry.toJSON(),
        averageLandedCost: landedCostInfo.averageLandedCost || null,
        // lastLandedCost: landedCostInfo.lastLandedCost || null,
        totalLandedCost: landedCostInfo.totalLandedCost || null,
        productCount: landedCostInfo.productCount || null,
        finalAverageLandedCost: landedCostInfo.finalAverageLandedCost || null,
        lastLandedCost: lastCostMap[productId] || null,
      };
    });

    paginatedData.data = enrichedResult

    return paginatedData;

  } catch (error) {
    console.error("Error in getInventoryList:", error);
    throw error;
  }
}


// export async function getInventoryListBasedOnSipl(clientId) {
//   console.log(clientId, 'clientId');

//   try {
//     const landedCosts = await model.landedCostModel.findAll({
//       attributes: [
//         'productId',
//         [Sequelize.fn('AVG', Sequelize.col('product_landed_cost_id')), 'averageLandedCost'],
//         [Sequelize.fn('MAX', Sequelize.col('created_at')), 'lastUpdatedAt'],
//       ],
//       group: ['productId'],
//       raw: true,
//     });

//     const lastLandedCosts = await model.landedCostModel.findAll({
//       attributes: [
//         'productId',
//         'productLandedCost',
//       ],
//       where: {
//         createdAt: {
//           [Op.eq]: Sequelize.literal("(SELECT MAX(`created_at`) FROM `product_landed_cost` WHERE `product_id` = `product_landed_cost`.`product_id`)")
//         }
//       },
//       raw: true,
//     });

//     const averageCostMap = Object.fromEntries(
//       landedCosts.map(cost => [cost.productId, cost])
//     );
//     const lastCostMap = Object.fromEntries(
//       lastLandedCosts.map(cost => [cost.productId, cost.productLandedCost])
//     );
//     const result = await model.productInventoryModel.findAll({
//       where: {
//         status: 'ACTIVE'
//       },
//       attributes: ["slabInStock", "quantityInStock", "slabAvailable", "quantityAvailable"],
//       include: [
//         {
//           model: model.inventoryInvoiceMapper,
//           as: "productInventoryInvoiceMapper",
//           attributes: ["inventoryInvoiceMapperId"],
//           include: [
//             {
//               model: model.poSupplierInvoiceModel,
//               as: "productInventoryInvoice",
//               attributes: ["poSupplierInvoiceId"],
//               include: [
//                 {
//                   model: model.poSlabDetails,
//                   as: "slabDetails",
//                   where: {
//                     status: {
//                       [Op.in]: ['ACTIVE', 'RETURNED', 'ONHOLD']
//                     }
//                   },
//                   include: [
//                     {
//                       model: model.locationModel,
//                       // as: 'slabLocation'
//                     }
//                   ],
//                   attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
//                 },
//                 {
//                   model: model.poSupplierInvoiceMapperModel,
//                   as: "transactionData",
//                   attributes: {
//                     exclude: ["createdAt", "updatedAt", "deletedAt", "status"],
//                   }
//                 }
//               ]
//             },
//           ],
//         },
//         {
//           model: model.productModel,
//           as: "salesProductDetails",
//           attributes: ["productId", "productName", "type", "baseColor", "origin", "kind", "category", "groupsAll"],
//         },
//         {
//           model: model.clientUserModel,
//           as: 'clientDetails',
//           attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
//           where: {
//             clientId: clientId
//           },
//         }
//       ],
//     });

//     const enrichedResult = result.map(entry => {
//       const productId = entry.salesProductDetails.productId;
//       return {
//         ...entry.toJSON(),
//         averageLandedCost: averageCostMap[productId]?.averageLandedCost || null,
//         lastLandedCost: lastCostMap[productId] || null,
//       };
//     });

//     return enrichedResult;

//   } catch (error) {
//     console.error("Error in getInventoryList:", error);
//     throw error;
//   }
// }
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
};