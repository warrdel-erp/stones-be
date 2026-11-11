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
      {
        name: 'Bad Debt Expense',
        key: 'bad_debt_expense',
        subHeaderId: 77, // 5.2.3 Uncollectible Accounts Expense (Reversal) (Expenses > Credit Losses)
        subHeaderCode: 523000,
        type: 'dr',
      },
      {
        name: 'Goods Received Not Invoiced (GRNI)',
        key: 'goods_received_not_invoiced',
        subHeaderId: 35, // 2.1.6 Other Accounts Payable and Accrued Liabilities (Liabilities > Payables > GRNI)
        subHeaderCode: 216000,
        type: 'cr',
      },
      {
        name: 'Accounts Payable Write-off Income',
        key: 'accounts_payable_write_off_income',
        subHeaderId: 80, // 6.1.1 Other Revenue (Other Income > Liability Write-offs)
        subHeaderCode: 611000,
        type: 'cr',
      },
      {
        name: 'Inventory Adjustment Gain',
        key: 'inventory_adjustment_gain',
        subHeaderId: 82, // 6.2.1 Inventory Gain and Loss (Other Income > Inventory Adjustments)
        subHeaderCode: 621000,
        type: 'cr',
      },
      {
        name: 'Inventory Adjustment Loss',
        key: 'inventory_adjustment_loss',
        subHeaderId: 82, // 6.2.1 Inventory Gain and Loss (Expenses > Inventory Adjustments)
        subHeaderCode: 621000,
        type: 'dr',
      },
      {
        name: 'Landed Cost Clearing',
        key: 'landed_cost_clearing',
        subHeaderId: 14, // 1.4.4 Additional Assets (Assets > Current Assets > Landed Cost Clearing)
        subHeaderCode: 144000,
        type: 'dr',
      },
      {
        name: 'Outward Freight Expense',
        key: 'outward_freight_expense',
        subHeaderId: 76, // 5.2.2 Selling, General and Administrative Expense (Expenses > Selling & Distribution > Delivery Expense)
        subHeaderCode: 522000,
        type: 'dr',
      },
      {
        name: 'Payment Clearing',
        key: 'payment_clearing',
        subHeaderId: 1, // 1.1.1 Cash and Cash Equivalents (Assets > Current Assets > Payment Clearing)
        subHeaderCode: 111000,
        type: 'dr',
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
        'bad_debt_expense',
        'goods_received_not_invoiced',
        'accounts_payable_write_off_income',
        'inventory_adjustment_gain',
        'inventory_adjustment_loss',
        'landed_cost_clearing',
        'outward_freight_expense',
        'payment_clearing',
      ],
    });
  },
};
