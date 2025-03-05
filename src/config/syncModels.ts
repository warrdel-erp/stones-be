// these unused imports are not redundant, They are useful to sync models
import * as models from "../models";
import { sequelize } from "./database";

export const syncModels = async () => {
  await models.Client.sync({ alter: true });
  await models.Client.sync({ alter: true });
  await models.Location.sync({ alter: true });
  await models.ProductCategory.sync({ alter: true });
  await models.User.sync({ alter: true });
  await models.Notes.sync({ alter: true });
  await models.Vendor.sync({ alter: true });
  await models.PurchaseOrder.sync({ alter: true });

  await models.SIPL.sync({ alter: true });
  sequelize.sync({ alter: true });
};
