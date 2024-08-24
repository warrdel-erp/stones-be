import * as model from "../models/index.js";
// import { Op } from "sequelize";

export async function getPrePurchaseProductDetails(prePurchaseOrderId) {
  console.log(prePurchaseOrderId,'ksjdhkds');
  
  try {
    const result = await model.prePurchaseModel.findOne({
      where: {
        prePurchaseOrderId: prePurchaseOrderId
      }
    });
    console.log(result,'resulse');
    
    return result;
  } catch (error) {
    console.error("Error in fetching pre-purchase product details:", error);
    throw error;
  }
}


//update prepurchase invoice product details
export async function updatePrePurchaseProductDetails(data) {
  try {
    const result = await model.prePurchaseModel.update(data, {
      where: {
        prePurchaseOrderId: data.prePurchaseOrderId
      }
    });
    return result;
  } catch (error) {
    console.error("Error in updating pre-purchase product details:", error);
    throw error;
  }
}

