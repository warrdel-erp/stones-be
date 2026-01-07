import * as models from "../models";

// Get location options for dropdowns/selects
export const getLocationOptions = async (clientId: number, status?: string) => {
  return models.Location.findAll({
    attributes: [
      ["location", "label"],
      ["id", "value"],
    ],
    where: {
      clientId,
      ...(status ? { status } : {}),
    },
    order: [["location", "ASC"]],
  });
};

// Get location by id
export const getLocationById = async (id: number, clientId?: number) => {
  const whereCondition: any = { id };
  
  if (clientId) {
    whereCondition.clientId = clientId;
  }

  return await models.Location.findOne({
    where: whereCondition,
  });
};

