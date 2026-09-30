'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE s3_files MODIFY COLUMN entityType ENUM('customer', 'vendor', 'product', 'salesOrder', 'purchaseOrder', 'sipl', 'inventoryProduct', 'packagingList', 'payment', 'bill', 'client');
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE s3_files MODIFY COLUMN entityType ENUM('customer', 'vendor', 'product', 'salesOrder', 'purchaseOrder', 'sipl', 'inventoryProduct', 'packagingList', 'payment', 'bill');
    `);
  }
};
