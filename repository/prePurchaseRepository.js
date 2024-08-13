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
  export async function updatePrePurchaseProductDetails(data, options) {
    try {
        const result = await model.prePurchaseModel.update(data, options);
        return result;
    } catch (error) {
        console.error("Error in updating pre-purchase product details:", error);
        throw error;
    }
  }