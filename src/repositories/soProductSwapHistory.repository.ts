import { Transaction } from "sequelize";
import * as models from "../models";

export const createSoProductSwapHistory = async (
  data: { inventoryProductId: number; salesProductId: number },
  transaction?: Transaction
) => {
  return await models.SoProductSwapHistory.create(data, { transaction });
};

export const getSwapHistoryBySalesProductId = async (salesProductId: number) => {
  return await models.SoProductSwapHistory.findAll({
    where: { salesProductId },
    include: [
      {
        association: "inventoryProduct",
        attributes: ["id", "isSlabType"],
        include: [
          {
            association: "product",
            attributes: ["id", "name", "code"],
            include: [
              {
                association: "productGroup",
                attributes: ["id", "name"],
              },
              {
                association: "productBaseColor",
                attributes: ["id", "name"],
              },
              {
                association: "productFinish",
                attributes: ["id", "name"],
              }
            ]
          },
          {
            association: "slab",
            attributes: ["id", "receivingLength", "receivingWidth", "receivingThickness"],
          },
          {
            association: "genericProduct",
            attributes: ["id", "name"],
          }
        ]
      }
    ],
    order: [["createdAt", "DESC"]]
  });
};
