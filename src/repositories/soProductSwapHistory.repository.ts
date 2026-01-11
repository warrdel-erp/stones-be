import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createSoProductSwapHistory = async (
  data: { inventoryProductId: number; salesProductId: number },
  transaction?: Transaction
) => {
  return await scoped(models.SoProductSwapHistory).create(data, { transaction });
};

export const getSwapHistoryBySalesProductId = async (salesProductId: number) => {
  return await scoped(models.SoProductSwapHistory).findAll({
    where: { salesProductId },
    include: [
      {
        association: "inventoryProduct",
        // attributes: ["id", "isSlabType"],
        include: [
          {
            association: "product",
            attributes: ["id", "name"],
            include: [
              {
                association: "group",
                attributes: ["id", "name"],
              },
              {
                association: "baseColor",
                attributes: ["id", "name"],
              },
              {
                association: "finish",
                attributes: ["id", "name"],
              }
            ]
          },
          {
            association: "slab",
            // attributes: ["id", "receivingLength", "receivingWidth"],
          },
          {
            association: "genericProduct",
            // attributes: ["id", "name"],
          }
        ]
      }
    ],
    order: [["createdAt", "DESC"]]
  });
};
