import { sequelize } from './config/database';
import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.addColumn('holds', 'supersededByQuotationId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    console.log('Added supersededByQuotationId to holds');
  } catch(e: any) { console.error(e.message); }
  
  try {
    await queryInterface.addColumn('opportunity_quotations', 'supersededByHoldId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    console.log('Added supersededByHoldId to opportunity_quotations');
  } catch(e: any) { console.error(e.message); }
  
  try {
    await queryInterface.changeColumn('holds', 'stage', {
      type: DataTypes.ENUM('initiated', 'soCreated', 'superseded'),
    });
    console.log('Updated ENUM in holds');
  } catch(e: any) { console.error(e.message); }
  process.exit();
}
run();
