// these unused imports are not redundant, They are useful to sync models
import { sequelize } from "./database";

export const syncModels = () => {
  sequelize.sync({ alter: true });
};
