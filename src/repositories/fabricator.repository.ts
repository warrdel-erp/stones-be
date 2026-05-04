import * as models from "../models";
import { CUSTOMER_TYPE } from "../constants/tableTypes";
import { scoped } from "../utils/scoped";

export const getProductsSoldToFabricator = async (fabricatorId: number) => {
  return await scoped(models.Product).findAll({
    include: [
      {
        association: "inventoryProducts",
        attributes: [],
        required: true,
        include: [
          {
            association: "salesOrderProducts",
            attributes: [],
            required: true,
            include: [
              {
                association: "salesOrder",
                attributes: [],
                required: true,
                where: { customerId: fabricatorId },
              },
            ],
          },
        ],
      },
    ],
    group: ["products.id"],
  });
};

export const findFabricatorById = async (id: number) => {
  return await scoped(models.Customer).findOne({
    where: {
      id,
      type: CUSTOMER_TYPE.FABRICATOR,
    },
  });
};
export const getInventoryProductsSoldToFabricator = async (fabricatorId: number, productId: number) => {
  return await scoped(models.InventoryProduct).findAll({
    where: { productId },
    include: [
      {
        association: "salesOrderProducts",
        required: true,
        include: [
          {
            association: "salesOrder",
            required: true,
            where: { customerId: fabricatorId },
          },
        ],
      },
      {
        association: "slab",
      },
      {
        association: "genericProduct",
      },
      {
        association: "bin",
        attributes: ["id", "name"],
      },
    ],
  });
};
