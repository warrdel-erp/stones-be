import { PaginatedData } from "../helpers/paginatedData.js";
import * as model from "../models/index.js";
import { Op, Sequelize, where } from "sequelize";

export async function createOrder(data) {
  try {
    const result = await model.salesOrderModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in create order:", error);
    throw error;
  }
}

export async function updateOrder(salesOrdersId, data) {
  try {
    const result = await model.salesOrderModel.update(data, {
      where: {
        salesOrdersId: salesOrdersId
      }
    });
    return result;
  } catch (error) {
    console.error("Error in updating sales order:", error);
    throw error;
  }
}

export async function findSoNumber(soNumber) {
  const result = await model.salesOrderModel.findOne({
    where: {
      so: {
        [Op.eq]: soNumber
      }
    }
  })
  return result;
}

export async function latestPoNumber(clientId) {
  try {
    const attributes = ['so'];
    const result = await model.salesOrderModel.findAll({
      attributes: attributes,
      order: [['created_at', 'DESC']],
      // limit: 1,
      include: [
        {
          model: model.clientUserModel,
          as: 'clientDetails',
          attributes: { exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'] },
          where: {
            clientId: clientId
          }
        }
      ]
    });

    return result.length;
  } catch (error) {
    console.log("Error getting SO Number: ", error);
    throw error;
  }
}

export async function getSingleSalesOrder(soNumber) {
  try {
    const result = await model.salesOrderModel.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      include: [
        {
          model: model.customerModel,
          as: "customers",
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
        },
        {
          model: model.salesOrderInventoryModel,
          as: 'salesInventory',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
          include: [
            {
              model: model.poSlabDetails,
              as: 'slabDetails',
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] }
            },
            {
              model: model.productInventoryModel,
              as: 'salesProduct',
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
              include: [
                {
                  model: model.productModel,
                  as: 'salesProductDetails',
                  attributes: ['productName']
                }
              ]
            }
          ]
        },
        {
          model: model.soLoadingOrderModel,
          as: 'loadingOrders',
          attributes: { exclude: ['updatedAt', 'deletedAt'] },
        },
      ],
      where: {
        salesOrdersId: soNumber
      },
    });
    return result;
  } catch (error) {
    console.error(`Error in getting sales order Id :-${soNumber}:`, error);
    throw error;
  }
}

export async function getsalestax(salesOrderId) {
  const result = await model.salesOrderModel.findOne({
    where: {
      salesOrdersId: salesOrderId,
    },
    attributes: ['salesTax']
  });
  const salesTaxString = result ? result.salesTax : null;
  let salesTaxPercentage = null;

  if (salesTaxString) {
    const match = salesTaxString.match(/(\d+)%/);
    if (match) {
      salesTaxPercentage = match[0]; // Extracts the integer part as a string
    }
  }
  return salesTaxPercentage;
};

export async function addProduct(data) {
  try {
    const result = await model.salesOrderInventoryModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add product:", error);
    throw error;
  }
}

export async function createLoadingOrder(data) {
  try {
    const result = await model.soLoadingOrderModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in create loading order:", error);
    throw error;
  }
}

export async function updateSalesOrderInventory(salesOrdersInventoryId, data) {
  try {
    const result = await model.salesOrderInventoryModel.update(data, {
      where: {
        salesOrdersInventoryId: salesOrdersInventoryId
      }
    });
    return result;
  } catch (error) {
    console.error("Error in updating sales order Inventory:", error);
    throw error;
  }
}

// get all sales order
export async function getAllSalesOrder(data, limit, page) {
  try {
    const offset = (page - 1) * limit;
    let totalPaidData = null;

    // --------------- Applying Filters S -------------------
    let whereCondition = {};

    // If Search exists match it inside 'so'.
    if (data.search) {
      whereCondition.so = {
        [Op.like]: `%${data?.search}%`
      }
    }

    // Add status and location conditions.
    whereCondition = {
      ...whereCondition,
      ...(data.location && { locationId: data.locationId })
    }

    // SO that have loading order created.
    if (data.status === "LOADING_ORDER") {
      whereCondition.sales_orders_id = {
        [Sequelize.Op.in]: Sequelize.literal(
          `(select sales_orders_id from so_loading_order WHERE sales_status = 'LOADING ORDER')` // Subquery to fetch IDs with loading order.
        ),
      }
    } else if (data.status === "PACKAGING_LIST") {
      whereCondition.sales_orders_id = {
        [Sequelize.Op.in]: Sequelize.literal(
          `(select sales_orders_id from so_loading_order WHERE sales_status = 'PACKING LIST')` // Subquery to fetch IDs with packaging list.
        ),
      }
    } else if (data.status === "OPEN") {
      whereCondition.sales_orders_id = {
        [Sequelize.Op.notIn]: Sequelize.literal(
          `(select sales_orders_id from so_loading_order WHERE sales_orders_id IS NOT NULL)` // Subquery to fetch IDs with packaging list.
        ),
      }
    } else if (data.status === "PENDING_PAYMENT") {
      totalPaidData = await getTotalPaidAmountForSO(offset, limit)
    }
    else if (data.status) {
      whereCondition.status = data.status
    }


    // --------------- Applying Filters E -------------------
    const result = await model.salesOrderModel.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['updatedAt', 'deletedAt', 'status'] },
      include: [
        {
          model: model.clientUserModel,
          as: 'clientDetails',
          attributes: {
            exclude: ['clientId', 'clientUserId', 'createdAt', 'deletedAt', 'updatedAt', 'userId'],
          },
          include: [
            {
              model: model.userModel,
              attributes: ['username', 'phone', 'email']
            }
          ],
          where: {
            clientId: data.clientId
          },
        },
        {
          model: model.customerModel,
          as: 'customers',
          attributes: ["customerName"],
        },
        {
          model: model.salesOrderInventoryModel,
          as: 'salesInventory',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] }
        },
        {
          model: model.locationModel,
          as: 'clientLocation',
          attributes: ['location']
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true, // To remove duplicate value generated by joins.
      offset,
      limit,
    });

    // Calculate total amount.
    const totalPriceArr = await model.salesOrderModel.findAll({
      where: whereCondition,
      attributes: [
        "salesOrdersId",
        [Sequelize.fn("SUM", Sequelize.literal("`salesInventory->slabDetails`.`receving_length` * `salesInventory->slabDetails`.`receving_width` * `salesInventory`.`unit_price` / 144 * ((`salesInventory`.`tax` + 100)/100)")), "totalPriceWithTax"],
        [Sequelize.fn("SUM", Sequelize.literal("`salesInventory->slabDetails`.`receving_length` * `salesInventory->slabDetails`.`receving_width` * `salesInventory`.`unit_price` / 144")), "totalPriceWithoutTax"]
      ],
      include: [
        {
          model: model.salesOrderInventoryModel,
          as: 'salesInventory',
          attributes: [],
          include: [
            {
              model: model.poSlabDetails,
              as: "slabDetails",
              attributes: []
            }
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      distinct: true, // To remove duplicate value generated by joins.
      offset,
      limit,
      subQuery: false,
      group: ["sales_orders.sales_orders_id"]
    });

    // Combine total product, totalPaid Data data to PO.
    result.rows = result.rows.map(e => {
      const plainObj = e.toJSON();

      const totalPriceData = totalPriceArr?.find(k => k.salesOrdersId == e.salesOrdersId)?.dataValues;

      return {
        ...plainObj,
        totalPaidAmount: totalPaidData?.find(k => k.salesOrdersId == e.salesOrdersId)?.dataValues?.totalPayedAmount || 0,
        totalPriceWithTax: totalPriceData?.totalPriceWithTax || 0,
        totalPriceWithoutTax: totalPriceData?.totalPriceWithoutTax || 0,
      }

    })

    if (data.status == "PENDING_PAYMENT") {
        result.rows = result.rows.filter(e => Math.trunc(e.totalPriceWithTax) > Math.trunc(e.totalPaidAmount));
    }

    return PaginatedData(result, limit, page);
  } catch (error) {
    console.error(`Error in getting sales Order ${data.search}:`, error);
    throw error;
  }
};

const getTotalPaidAmountForSO = async (offset, limit) => {

  // Algo--------
  // 1. get all loading orders for a SO
  // 2. find loading_order in account transaction with entry-type "cr"
  // 3. add all transaction_amount
  // 4. if this sum is less then it is pending payment SO 
  return await model.salesOrderModel.findAll({
    order: [['createdAt', 'DESC']],
    attributes: [
      "salesOrdersId",
      [
        Sequelize.fn("SUM", Sequelize.literal("`loadingOrders->accountTransaction`.`transaction_amount`")),
        "totalPayedAmount"
      ]
    ],
    include: [
      {
        model: model.soLoadingOrderModel,
        as: "loadingOrders",
        attributes: [],
        include: [
          {
            model: model.accountTransactionModel,
            as: "accountTransaction",
            where: {
              entryType: "cr"
            },
            attributes: []
          }
        ]
      }
    ],
    group: ["sales_orders.sales_orders_id", "loadingOrders.so_loading_order_id"],
    subQuery: false,
    offset,
    limit,
  });

}

// get the sales Order Inventory by sales Orders Inventory Id for update sale Status and product Inventory Inactive.

export async function findSalesOrdersInventory(soLoadingOrderId) {
  try {
    const result = await model.salesOrderInventoryModel.findAll({
      attributes: ['salesOrdersInventoryId', 'productInventoryId', 'poSlabDetailId', 'soLoadingOrderId', 'salesStatus'],
      where: {
        soLoadingOrderId: soLoadingOrderId
      }
    });
    return result;
  } catch (error) {
    console.error('Error fetching sales order inventory:', error);
    throw error;
  }
};

// update sale Status on packing list

export async function updateSalesStatusOnPackagingList(data) {
  const poSlabDetailId = data.poSlabDetailId
  try {
    const result = await model.salesOrderInventoryModel.update(data, {
      where: {
        poSlabDetailId: poSlabDetailId
      }
    });
  } catch (error) {
    console.error("Error updating Sales Status in sales order inventory:", error);
    throw error;
  }
};


// update sale Status and return the updated sales status

export async function updateSalesStatus(salesOrdersInventoryId, data) {
  try {
    // Update the sales order inventory
    const result = await model.salesOrderInventoryModel.update(data, {
      where: {
        salesOrdersInventoryId: salesOrdersInventoryId
      }
    });
    // If update was successful, fetch the updated record
    if (result[0] === 1) {
      const updatedRecord = await model.salesOrderInventoryModel.findOne({
        where: {
          salesOrdersInventoryId: salesOrdersInventoryId
        },
        attributes: ['Sales_status']
      });
      return updatedRecord.dataValues.Sales_status;
    } else {
      throw new Error('Update failed or no rows affected');
    }
  } catch (error) {
    console.error("Error updating Sales Status in sales order inventory:", error);
    throw error;
  }
};

// update  sales Status in both table sales order Inventory and so loading order 

export async function updateSalesStatusLoadingOrder(soLoadingOrderId, data) {
  try {
    const result = await model.soLoadingOrderModel.update(data, {
      where: {
        soLoadingOrderId: soLoadingOrderId
      }
    });
    return result;
  } catch (error) {
    console.error("Error updating sales status in so loading order:", error);
    throw error;
  }
}


//create add payemnt for salesOrder 
export async function addPayment(data) {
  try {
    const result = await model.salesPaymentModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add paymentr:", error);
    throw error;
  }
};

// Get payment details of sales order from account_transection table.
export async function getPaymentDetailsFromAccountTransection(soLoadingOrderId) {
  try {

    const result = await model.accountTransactionModel.findAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      where: {
        soLoadingOrderId: soLoadingOrderId,
        entryType: 'cr',
      },
      include: [{
        model: model.soLoadingOrderModel,
        as: "soLoadingOrders",
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      }],
    });

    if (!result) {
      return { message: `No data found for soLoadingOrderId: ${soLoadingOrderId}` };
    }

    return result;
  } catch (error) {
    console.error(`Error in getting payment details for soLoadingOrderId: ${soLoadingOrderId}`, error.message);
    return { error: error.message };
  }
};

// Get payment details of sales order
export async function getPaymentDetails(soLoadingOrderId, salesOrderId) {
  try {
    console.log(`Fetching payment details for soloadingOrderId: ${soLoadingOrderId} and salesOrderId: ${salesOrderId}`);

    const result = await model.salesPaymentModel.findOne({
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      where: {
        soLoadingOrderId: soLoadingOrderId,
        salesOrderId: salesOrderId
      },
      include: [{
        model: model.soLoadingOrderModel,
        as: "so_loading_order",
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] },
      }],
    });

    if (!result) {
      return { message: `No data found for soLoadingOrderId: ${soLoadingOrderId} and salesOrderId: ${salesOrderId}` };
    }

    return result;
  } catch (error) {
    console.error(`Error in getting payment details for soLoadingOrderId: ${soLoadingOrderId} and salesOrderId: ${salesOrderId}`, error.message);
    return { error: error.message };
  }
};


// Get customer data of sales payment 
export async function getSalesPaymenetDataOfCustomer() {
  try {
    const result = await model.salesOrderModel.findAll({
      include: [
        {
          model: model.customerModel,
          as: 'customers',
          attributes: ['customer_name', 'customer_id']
        },
        {
          model: model.soLoadingOrderModel,
          as: 'loadingOrders',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] }
        },
        {
          model: model.salesPaymentModel,
          as: 'salesOrderPaymentDetails',
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] }
        }
      ]
    });
    return result;
  } catch (error) {
    console.error("Error in getting sales payment data:", error);
    throw error;
  }
};



//create credit transaction for sales account
export async function createTransactionAccountSales(data) {
  try {
    const result = await model.salesCreditTransactionModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in add paymentr:", error);
    return error
  }
};

export async function closeSalesOrder(data) {
  try {
    const result = await model.salesOrderModel.update(data,
      {
        where: {
          salesOrdersId: data.salesOrdersId,
        }
      }
    );
    return result;
  } catch (error) {
    console.error("Error in closing sales order:", error);
    return error;
  }
}



export async function updateSlabToPicked(data) {
  try {
    const result = await model.salesOrderInventoryModel.update(
      { slabPicked: true },
      {
        where: {
          salesOrdersInventoryId: data.salesOrdersInventoryId,
        }
      }
    );
    return result;
  } catch (error) {
    console.error("Error updating slabPicked status:", error);
    return error;
  }
}

export async function updateTax(poSlabDetailId, tax) {
  try {
    const result = await model.salesOrderInventoryModel.update({ tax },
      {
        where: {
          poSlabDetailId: poSlabDetailId,
        }
      }
    );
    return result;
  } catch (error) {
    console.error("Error updating sales Tax:", error);
    return error;
  }
}

export async function deleteSlab(slabId) {
  try {
    const result = await model.salesOrderInventoryModel.update(
      { deletedAt: sequelize.literal('CURRENT_TIMESTAMP') },
      {
        where: {
          poSlabDetailId: slabId,
        }
      }
    );
    return result;
  } catch (error) {
    console.error("Error updating slabPicked status:", error);
    return error;
  }
}


export async function fetchAllPl(clientId) {
  const allusersObj = await model.clientUserModel.findAll({
    where: {
      clientId
    }
  })

  const userIds = allusersObj.map(data => data.dataValues.userId)

  try {
    const result = await model.soLoadingOrderModel.findAll({
      where: {
        createdBy: {
          [Op.in]: userIds
        },
        salesStatus: "PACKING LIST"
      },
      include: [
        {
          model: model.salesOrderInventoryModel,
        },
        {
          model: model.salesOrderModel,
          include: [
            {
              model: model.customerModel,
              as: "customers"
            },
            {
              model: model.locationModel,
              as: 'clientLocation',
            },
            {
              model: model.userModel,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'status'] }
            }
          ]
        }
      ]
    });

    return result;
  } catch (error) {
    console.error("Error while Fetching PL:", error);
    return error;
  }
}