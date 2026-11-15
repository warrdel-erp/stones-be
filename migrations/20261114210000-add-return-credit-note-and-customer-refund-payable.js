'use strict';

const CREDIT_NOTE_REFERENCE_TYPES = [
  'payment',
  'sipl',
  'return'
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Alter credit_debit_notes.referenceType ENUM to include 'return'
    const cdQuery = `ALTER TABLE credit_debit_notes MODIFY COLUMN referenceType ENUM('${CREDIT_NOTE_REFERENCE_TYPES.join("', '")}');`;
    await queryInterface.sequelize.query(cdQuery);

    // 2. Ensure 'Customer Refund Payable' default ledger account exists for all clients
    const [clients] = await queryInterface.sequelize.query('SELECT id FROM clients');
    const now = new Date();

    const accountToEnsure = {
      name: 'Customer Refund Payable',
      key: 'customer_refund_payable',
      subHeaderId: 38, // 2.2.3 Deferred Income and Refund Liabilities
      subHeaderCode: 223000,
      type: 'cr',
    };

    for (const client of clients) {
      const clientId = client.id;

      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM ledger_accounts WHERE clientId = :clientId AND (`key` = :key OR LOWER(name) = LOWER(:name)) LIMIT 1',
        {
          replacements: {
            clientId,
            key: accountToEnsure.key,
            name: accountToEnsure.name,
          },
        }
      );

      if (existing.length === 0) {
        const [lastRows] = await queryInterface.sequelize.query(
          'SELECT code FROM ledger_accounts WHERE clientId = :clientId AND subHeaderId = :subHeaderId ORDER BY id DESC LIMIT 1',
          {
            replacements: {
              clientId,
              subHeaderId: accountToEnsure.subHeaderId,
            },
          }
        );

        const nextCode =
          lastRows.length > 0 && lastRows[0].code
            ? Number(lastRows[0].code) + 1
            : accountToEnsure.subHeaderCode + 1;

        await queryInterface.bulkInsert('ledger_accounts', [
          {
            name: accountToEnsure.name,
            key: accountToEnsure.key,
            subHeaderId: accountToEnsure.subHeaderId,
            type: accountToEnsure.type,
            openingBalance: 0,
            openingDate: now,
            code: nextCode,
            clientId: clientId,
          },
        ]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const OLD_CREDIT_NOTE_REFERENCE_TYPES = CREDIT_NOTE_REFERENCE_TYPES.filter(v => v !== 'return');
    const cdQuery = `ALTER TABLE credit_debit_notes MODIFY COLUMN referenceType ENUM('${OLD_CREDIT_NOTE_REFERENCE_TYPES.join("', '")}');`;
    await queryInterface.sequelize.query(cdQuery);

    await queryInterface.bulkDelete('ledger_accounts', {
      key: 'customer_refund_payable',
    });
  }
};

