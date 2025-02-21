import { array } from "zod";
import * as model from "../models/index.js";
// import { Op } from "sequelize";

export async function getPrePurchaseProductDetails(prePurchaseOrderId) {
  try {
    const result = await model.prePurchaseModel.findOne({
      where: {
        prePurchaseOrderId: prePurchaseOrderId
      }
    });

    return result;
  } catch (error) {
    console.error("Error in fetching pre-purchase product details:", error);
    throw error;
  }
}


//update prepurchase invoice product details
export async function updatePrePurchaseProductDetails(data) {
  try {

    let result;

    if (Array.isArray(data)) {
      data.forEach(async e => {
        result = await model.prePurchaseModel.update(e, {
          where: {
            prePurchaseOrderId: e.prePurchaseOrderId
          }
        });
        console.log(result)
      })
      // result = model.prePurchaseModel.bulkCreate(data, { updateOnDuplicate: ["prePurchaseOrderId"] })
    } else {

      result = await model.prePurchaseModel.update(data, {
        where: {
          prePurchaseOrderId: data.prePurchaseOrderId
        }
      });
    }



    return {result: "products updated successfully"};
  } catch (error) {
    console.error("Error in updating pre-purchase product details:", error);
    throw error;
  }
}

