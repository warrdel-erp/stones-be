// these unused imports are not redundant, They are useful to sync models
import { ProductCategory } from "../models";
import { sequelize } from "./database";

export const syncModels = () => {
  ProductCategory.sync({ alter: true });
  sequelize.sync({ alter: true });
};
