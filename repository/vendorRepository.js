import * as model from "../models/index.js";
import { Op } from "sequelize";

export async function addVendors(data) {
  try {
    const result = await model.vendorModel.create(data);
    return result;
  } catch (error) {
    console.error("Error in create vendor:", error);
    throw error;
  }
}

export async function getAllVendor(data) {
    try {
      const result = await model.vendorModel.findAll({
        
      });
      return result;
    } catch (error) {
      console.error("Error in create vendor:", error);
      throw error;
    }
  }