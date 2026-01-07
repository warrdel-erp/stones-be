"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `
      ALTER TABLE journal_entries
      MODIFY COLUMN processType ENUM(
        'create_sipl',
        'add_freight_bill',
        'receive_inventory',
        'sipl_payment',
        'bill_payment',
        'so_invoicing',
        'so_invoice_payment',
        'confirm_return',
        'advance_deposit',
        'slab_split',
        'custom'
      ) NULL
    `;
    await queryInterface.sequelize.query(sql);
  },

  down: async (queryInterface, Sequelize) => {
    // WARNING: This will fail if any rows currently use 'slab_split'
    const sql = `
      ALTER TABLE journal_entries
      MODIFY COLUMN processType ENUM(
        'create_sipl',
        'add_freight_bill',
        'receive_inventory',
        'sipl_payment',
        'bill_payment',
        'so_invoicing',
        'so_invoice_payment',
        'confirm_return',
        'advance_deposit',
        'custom'
      ) NULL
    `;
    await queryInterface.sequelize.query(sql);
  },
};
