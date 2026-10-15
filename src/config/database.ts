import { Sequelize } from "sequelize-typescript";
import { DB_CONFIG } from "./dbConfig";
import dotenv from "dotenv";
import { applyTenantHooks } from "./tenantHooks";
dotenv.config();

export const sequelize = new Sequelize({
  database: DB_CONFIG.DATABASE,
  username: DB_CONFIG.USERNAME,
  password: DB_CONFIG.PASSWORD,
  host: DB_CONFIG.DB_HOST,
  port: DB_CONFIG.DB_PORT,
  // pool: {
  //   max: 10,
  //   min: 0,
  //   acquire: 30000,
  //   idle: 10000,
  // },
  logging: false,
  dialect: "mysql",
});

// Apply tenant isolation hooks
applyTenantHooks(sequelize);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};
