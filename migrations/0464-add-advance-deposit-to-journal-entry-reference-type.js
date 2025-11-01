"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MySQL: alter ENUM by redefining the column with the new set of values
    const sql = `
      ALTER TABLE journal_entries
      MODIFY COLUMN referenceType ENUM(
        'SIPL',
        'BILL',
        'LOADING_ORDER',
        'LOADING_ORDER_INVOICE',
        'SALES_ORDER',
        'RETURN',
        'ADVANCE_DEPOSIT'
      ) NULL
    `;
    await queryInterface.sequelize.query(sql);
  },

  down: async (queryInterface, Sequelize) => {
    // WARNING: This will fail if any rows currently use 'ADVANCE_DEPOSIT'
    const sql = `
      ALTER TABLE journal_entries
      MODIFY COLUMN referenceType ENUM(
        'SIPL',
        'BILL',
        'LOADING_ORDER',
        'LOADING_ORDER_INVOICE',
        'SALES_ORDER',
        'RETURN'
      ) NULL
    `;
    await queryInterface.sequelize.query(sql);
  },
};
