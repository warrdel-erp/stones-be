'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE sales_orders MODIFY COLUMN status ENUM('draft', 'open', 'completed', 'cancelled', 'closed') NOT NULL DEFAULT 'draft';
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      UPDATE sales_orders SET status = 'open' WHERE status = 'draft';
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE sales_orders MODIFY COLUMN status ENUM('open', 'completed', 'cancelled', 'closed') NOT NULL DEFAULT 'open';
    `);
  },
};

