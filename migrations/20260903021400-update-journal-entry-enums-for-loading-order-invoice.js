'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // We update the ENUM columns to include LOADING_ORDER_INVOICE and LOADING_ORDER
    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries 
      MODIFY COLUMN referenceType ENUM('SIPL','BILL','PACKAGING_LIST','PACKAGING_LIST_INVOICE','LOADING_ORDER','LOADING_ORDER_INVOICE','SALES_ORDER','RETURN','ADVANCE_DEPOSIT');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries 
      MODIFY COLUMN entryFor ENUM('SIPL','PACKAGING_LIST','LOADING_ORDER','RETURN');
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // If we rollback, we can't easily remove an ENUM value if data exists for it,
    // but we can try reverting to the original ENUMs if no conflicting data exists.
    // However, it's safer to just leave the ENUM expanded in the down migration, or revert if absolutely necessary.
    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries 
      MODIFY COLUMN referenceType ENUM('SIPL','BILL','PACKAGING_LIST','PACKAGING_LIST_INVOICE','SALES_ORDER','RETURN','ADVANCE_DEPOSIT');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE journal_entries 
      MODIFY COLUMN entryFor ENUM('SIPL','PACKAGING_LIST','RETURN');
    `);
  }
};
