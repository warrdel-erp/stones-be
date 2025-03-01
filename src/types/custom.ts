import { UpdateOptions } from "sequelize";

export interface CustomUpdateOptions extends UpdateOptions {
  userId: number; // Add userId to options
}
