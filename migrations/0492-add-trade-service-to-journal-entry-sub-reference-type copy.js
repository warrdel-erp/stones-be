"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MySQL: alter ENUM by redefining the column with the new set of values
    const sql = `
      ALTER TABLE journal_entries
      MODIFY COLUMN subReferenceType ENUM(
        'sipl_product',
        'product',
        'slab',
        'bill_item',
        'bill',
        'loading_order',
        'trade_service'
      ) NULL
    `;
    await queryInterface.sequelize.query(sql);
  },

  down: async (queryInterface, Sequelize) => {
    // WARNING: This will fail if any rows currently use 'trade_service'
    const sql = `
      ALTER TABLE journal_entries
      MODIFY COLUMN subReferenceType ENUM(
        'sipl_product',
        'product',
        'slab',
        'bill_item',
        'bill',
        'loading_order'
      ) NULL
    `;
    await queryInterface.sequelize.query(sql);
  },
};
