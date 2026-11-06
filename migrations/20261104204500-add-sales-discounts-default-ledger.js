'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [clients] = await queryInterface.sequelize.query('SELECT id FROM clients');
    const now = new Date();

    const accountsToEnsure = [
      {
        name: 'Sales Discounts',
        key: 'sales_discounts',
        subHeaderId: 68, // 4.3.1 Variable Consideration (Revenue > Adjustments / Contra Revenue)
        subHeaderCode: 431000,
        type: 'dr',
      },
      {
        name: 'Sales Returns & Allowances',
        key: 'sales_returns_and_allowances',
        subHeaderId: 68, // 4.3.1 Variable Consideration (Revenue > Adjustments / Contra Revenue)
        subHeaderCode: 431000,
        type: 'dr',
      },
      {
        name: 'Customer Advances',
        key: 'customer_advances',
        subHeaderId: 38, // 2.2.3 Deferred Income and Refund Liabilities (Liabilities > Contract Liabilities)
        subHeaderCode: 223000,
        type: 'cr',
      },
      {
        name: 'Delivery Charges Revenue',
        key: 'delivery_charges_revenue',
        subHeaderId: 65, // 4.1.2 Services (Revenue > Recognized Point of Time > Services)
        subHeaderCode: 412000,
        type: 'cr',
      },
    ];

    for (const client of clients) {
      const clientId = client.id;

      for (const account of accountsToEnsure) {
        const [existing] = await queryInterface.sequelize.query(
          'SELECT id FROM ledger_accounts WHERE client_id = :clientId AND ("key" = :key OR LOWER(name) = LOWER(:name)) LIMIT 1',
          {
            replacements: {
              clientId,
              key: account.key,
              name: account.name,
            },
          }
        );

        if (existing.length === 0) {
          const [lastRows] = await queryInterface.sequelize.query(
            'SELECT code FROM ledger_accounts WHERE client_id = :clientId AND sub_header_id = :subHeaderId ORDER BY id DESC LIMIT 1',
            {
              replacements: {
                clientId,
                subHeaderId: account.subHeaderId,
              },
            }
          );

          const nextCode =
            lastRows.length > 0 && lastRows[0].code
              ? Number(lastRows[0].code) + 1
              : account.subHeaderCode + 1;

          await queryInterface.bulkInsert('ledger_accounts', [
            {
              name: account.name,
              key: account.key,
              sub_header_id: account.subHeaderId,
              type: account.type,
              opening_balance: 0,
              opening_date: now,
              code: nextCode,
              client_id: clientId,
              created_at: now,
              updated_at: now,
            },
          ]);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ledger_accounts', {
      key: [
        'sales_discounts',
        'sales_returns_and_allowances',
        'customer_advances',
        'delivery_charges_revenue',
      ],
    });
  },
};
