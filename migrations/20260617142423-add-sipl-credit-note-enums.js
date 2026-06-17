"use strict";

const JOURNAL_ENTRY_PROCESS_TYPE = [
  "create_sipl",
  "add_freight_bill",
  "receive_inventory",
  "sipl_payment",
  "bill_payment",
  "so_invoicing",
  "so_invoice_payment",
  "confirm_return",
  "advance_deposit",
  "slab_split",
  "custom",
  "cancel_sipl",
  "sipl_credit_note"
];

const CREDIT_NOTE_REFERENCE_TYPES = [
  "payment",
  "sipl"
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MySQL requires redefining the entire ENUM to add new values
    const jeQuery = `ALTER TABLE journal_entries MODIFY COLUMN processType ENUM('${JOURNAL_ENTRY_PROCESS_TYPE.join("', '")}');`;
    const cdQuery = `ALTER TABLE credit_debit_notes MODIFY COLUMN referenceType ENUM('${CREDIT_NOTE_REFERENCE_TYPES.join("', '")}');`;

    await queryInterface.sequelize.query(jeQuery);
    await queryInterface.sequelize.query(cdQuery);
  },

  down: async (queryInterface, Sequelize) => {
    // Reverting back to previous ENUM values without the newly added ones
    const OLD_JOURNAL_ENTRY_PROCESS_TYPE = JOURNAL_ENTRY_PROCESS_TYPE.filter(v => v !== 'sipl_credit_note');
    const OLD_CREDIT_NOTE_REFERENCE_TYPES = CREDIT_NOTE_REFERENCE_TYPES.filter(v => v !== 'sipl');

    const jeQuery = `ALTER TABLE journal_entries MODIFY COLUMN processType ENUM('${OLD_JOURNAL_ENTRY_PROCESS_TYPE.join("', '")}');`;
    const cdQuery = `ALTER TABLE credit_debit_notes MODIFY COLUMN referenceType ENUM('${OLD_CREDIT_NOTE_REFERENCE_TYPES.join("', '")}');`;

    await queryInterface.sequelize.query(jeQuery);
    await queryInterface.sequelize.query(cdQuery);
  }
};
