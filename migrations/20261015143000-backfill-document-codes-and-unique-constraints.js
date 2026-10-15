'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableExists = async (table) => {
        try {
          await queryInterface.describeTable(table);
          return true;
        } catch {
          return false;
        }
      };

      const safeAddColumn = async (table, column, options) => {
        try {
          const tableDesc = await queryInterface.describeTable(table);
          if (!tableDesc[column]) {
            await queryInterface.addColumn(table, column, options);
          }
        } catch (err) {
          console.warn(`Could not add column ${column} to ${table}:`, err.message);
        }
      };

      const safeDropIndex = async (tableName, indexName) => {
        try {
          await queryInterface.removeIndex(tableName, indexName);
        } catch {}
        try {
          await queryInterface.sequelize.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`${indexName}\`;`);
        } catch {}
      };

      const safeAddUniqueIndex = async (table, fields, indexName) => {
        try {
          // Drop first if already exists so addIndex does not throw duplicate key name
          await safeDropIndex(table, indexName);
          await queryInterface.addIndex(table, fields, {
            unique: true,
            name: indexName,
          });
        } catch (err) {
          console.warn(`Unique index ${indexName} on ${table}:`, err.message);
        }
      };

      // 1. Ensure `code` column exists on all document tables
      const tables = ['sales_orders', 'purchase_orders', 'packaging_lists', 'loading_orders', 'holds', 'credit_debit_notes'];
      for (const tableName of tables) {
        if (await tableExists(tableName)) {
          await safeAddColumn(tableName, 'code', {
            type: Sequelize.STRING(100),
            allowNull: true,
          });
        }
      }

      if (await tableExists('credit_debit_notes')) {
        await safeAddColumn('credit_debit_notes', 'clientCreditNoteNumber', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }

      // 2. Disable foreign key checks and safe updates
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      await queryInterface.sequelize.query('SET SQL_SAFE_UPDATES = 0;');

      try {
        // ----------------------------------------------------
        // A. SALES ORDERS
        // ----------------------------------------------------
        if (await tableExists('sales_orders')) {
          // Drop unique index first so UPDATE/DELETE operations don't collide
          await safeDropIndex('sales_orders', 'sales_orders_client_code_unique');

          // DEDUPLICATE FIRST by clientSoNumber or existing code: keep earliest ID
          await queryInterface.sequelize.query(`
            DELETE s1 FROM sales_orders s1
            INNER JOIN sales_orders s2
            ON (s1.clientId = s2.clientId OR (s1.clientId IS NULL AND s2.clientId IS NULL))
              AND (
                (s1.code = s2.code AND s1.code IS NOT NULL AND s1.code != '')
                OR (s1.clientSoNumber = s2.clientSoNumber AND s1.clientSoNumber IS NOT NULL)
                OR (s1.code = CONCAT('SO-', s2.clientSoNumber) AND s2.clientSoNumber IS NOT NULL)
                OR (CONCAT('SO-', s1.clientSoNumber) = s2.code AND s1.clientSoNumber IS NOT NULL)
              )
              AND s1.id > s2.id;
          `);

          // Backfill code on remaining unique rows
          await queryInterface.sequelize.query(`
            UPDATE sales_orders
            SET code = CONCAT('SO-', COALESCE(clientSoNumber, id))
            WHERE code IS NULL OR code = '';
          `);

          // Final deduplication pass on code just in case
          await queryInterface.sequelize.query(`
            DELETE s1 FROM sales_orders s1
            INNER JOIN sales_orders s2
            ON (s1.clientId = s2.clientId OR (s1.clientId IS NULL AND s2.clientId IS NULL))
              AND s1.code = s2.code AND s1.id > s2.id;
          `);

          // Clean up orphaned child rows whose parent duplicate was removed
          try {
            await queryInterface.sequelize.query(`
              DELETE sop FROM sales_order_products sop
              LEFT JOIN sales_orders so ON sop.salesOrderId = so.id
              WHERE so.id IS NULL;
            `);
          } catch {}

          try {
            await queryInterface.sequelize.query(`
              DELETE soi FROM sales_order_invoices soi
              LEFT JOIN sales_orders so ON soi.salesOrderId = so.id
              WHERE so.id IS NULL;
            `);
          } catch {}

          try {
            await queryInterface.sequelize.query(`
              DELETE lo FROM loading_orders lo
              LEFT JOIN sales_orders so ON lo.salesOrderId = so.id
              WHERE so.id IS NULL;
            `);
          } catch {}

          try {
            await queryInterface.sequelize.query(`
              DELETE pl FROM packaging_lists pl
              LEFT JOIN sales_orders so ON pl.salesOrderId = so.id
              WHERE so.id IS NULL;
            `);
          } catch {}

          try {
            await queryInterface.sequelize.query(`
              DELETE ad FROM advanced_deposits ad
              LEFT JOIN sales_orders so ON ad.salesOrderId = so.id
              WHERE so.id IS NULL;
            `);
          } catch {}

          if (await tableExists('sales_order_requirement_lines')) {
            try {
              await queryInterface.sequelize.query(`
                DELETE sorl FROM sales_order_requirement_lines sorl
                LEFT JOIN sales_orders so ON sorl.sales_order_id = so.id
                WHERE so.id IS NULL;
              `);
            } catch {}
          }
        }

        // ----------------------------------------------------
        // B. PURCHASE ORDERS
        // ----------------------------------------------------
        if (await tableExists('purchase_orders')) {
          await safeDropIndex('purchase_orders', 'purchase_orders_client_code_unique');

          // Deduplicate first
          await queryInterface.sequelize.query(`
            DELETE p1 FROM purchase_orders p1
            INNER JOIN purchase_orders p2
            ON (p1.clientId = p2.clientId OR (p1.clientId IS NULL AND p2.clientId IS NULL))
              AND (
                (p1.code = p2.code AND p1.code IS NOT NULL AND p1.code != '')
                OR (p1.clientPoNumber = p2.clientPoNumber AND p1.clientPoNumber IS NOT NULL)
                OR (p1.code = CONCAT('PO-', p2.clientPoNumber) AND p2.clientPoNumber IS NOT NULL)
                OR (CONCAT('PO-', p1.clientPoNumber) = p2.code AND p1.clientPoNumber IS NOT NULL)
              )
              AND p1.id > p2.id;
          `);

          await queryInterface.sequelize.query(`
            UPDATE purchase_orders
            SET code = CONCAT('PO-', COALESCE(clientPoNumber, id))
            WHERE code IS NULL OR code = '';
          `);

          await queryInterface.sequelize.query(`
            DELETE p1 FROM purchase_orders p1
            INNER JOIN purchase_orders p2
            ON (p1.clientId = p2.clientId OR (p1.clientId IS NULL AND p2.clientId IS NULL))
              AND p1.code = p2.code AND p1.id > p2.id;
          `);

          // Clear orphaned references from inventory products / sipls without deleting items
          try {
            await queryInterface.sequelize.query(`
              UPDATE inventory_products ip
              LEFT JOIN purchase_orders po ON ip.purchaseOrderId = po.id
              SET ip.purchaseOrderId = NULL
              WHERE ip.purchaseOrderId IS NOT NULL AND po.id IS NULL;
            `);
          } catch {}

          try {
            await queryInterface.sequelize.query(`
              UPDATE sipls s
              LEFT JOIN purchase_orders po ON s.purchaseOrderId = po.id
              SET s.purchaseOrderId = NULL
              WHERE s.purchaseOrderId IS NOT NULL AND po.id IS NULL;
            `);
          } catch {}

          try {
            await queryInterface.sequelize.query(`
              DELETE rpp FROM requested_purchase_products rpp
              LEFT JOIN purchase_orders po ON rpp.purchaseOrderId = po.id
              WHERE po.id IS NULL;
            `);
          } catch {}
        }

        // ----------------------------------------------------
        // C. PACKAGING LISTS
        // ----------------------------------------------------
        if (await tableExists('packaging_lists')) {
          await safeDropIndex('packaging_lists', 'packaging_lists_client_code_unique');

          await queryInterface.sequelize.query(`
            DELETE pl1 FROM packaging_lists pl1
            INNER JOIN packaging_lists pl2
            ON (pl1.clientId = pl2.clientId OR (pl1.clientId IS NULL AND pl2.clientId IS NULL))
              AND (
                (pl1.code = pl2.code AND pl1.code IS NOT NULL AND pl1.code != '')
                OR (pl1.clientPlNumber = pl2.clientPlNumber AND pl1.clientPlNumber IS NOT NULL)
                OR (pl1.code = CONCAT('PL-', pl2.clientPlNumber) AND pl2.clientPlNumber IS NOT NULL)
                OR (CONCAT('PL-', pl1.clientPlNumber) = pl2.code AND pl1.clientPlNumber IS NOT NULL)
              )
              AND pl1.id > pl2.id;
          `);

          await queryInterface.sequelize.query(`
            UPDATE packaging_lists
            SET code = CONCAT('PL-', COALESCE(clientPlNumber, id))
            WHERE code IS NULL OR code = '';
          `);

          await queryInterface.sequelize.query(`
            DELETE pl1 FROM packaging_lists pl1
            INNER JOIN packaging_lists pl2
            ON (pl1.clientId = pl2.clientId OR (pl1.clientId IS NULL AND pl2.clientId IS NULL))
              AND pl1.code = pl2.code AND pl1.id > pl2.id;
          `);
        }

        // ----------------------------------------------------
        // D. LOADING ORDERS
        // ----------------------------------------------------
        if (await tableExists('loading_orders')) {
          await safeDropIndex('loading_orders', 'loading_orders_client_code_unique');

          await queryInterface.sequelize.query(`
            DELETE lo1 FROM loading_orders lo1
            INNER JOIN loading_orders lo2
            ON (lo1.clientId = lo2.clientId OR (lo1.clientId IS NULL AND lo2.clientId IS NULL))
              AND (
                (lo1.code = lo2.code AND lo1.code IS NOT NULL AND lo1.code != '')
                OR (lo1.clientLoNumber = lo2.clientLoNumber AND lo1.clientLoNumber IS NOT NULL)
                OR (lo1.code = CONCAT('LO-', lo2.clientLoNumber) AND lo2.clientLoNumber IS NOT NULL)
                OR (CONCAT('LO-', lo1.clientLoNumber) = lo2.code AND lo1.clientLoNumber IS NOT NULL)
              )
              AND lo1.id > lo2.id;
          `);

          await queryInterface.sequelize.query(`
            UPDATE loading_orders
            SET code = CONCAT('LO-', COALESCE(clientLoNumber, id))
            WHERE code IS NULL OR code = '';
          `);

          await queryInterface.sequelize.query(`
            DELETE lo1 FROM loading_orders lo1
            INNER JOIN loading_orders lo2
            ON (lo1.clientId = lo2.clientId OR (lo1.clientId IS NULL AND lo2.clientId IS NULL))
              AND lo1.code = lo2.code AND lo1.id > lo2.id;
          `);
        }

        // ----------------------------------------------------
        // E. HOLDS
        // ----------------------------------------------------
        if (await tableExists('holds')) {
          await safeDropIndex('holds', 'holds_client_code_unique');

          await queryInterface.sequelize.query(`
            DELETE h1 FROM holds h1
            INNER JOIN holds h2
            ON (h1.clientId = h2.clientId OR (h1.clientId IS NULL AND h2.clientId IS NULL))
              AND (
                (h1.code = h2.code AND h1.code IS NOT NULL AND h1.code != '')
                OR (h1.clientHoldNumber = h2.clientHoldNumber AND h1.clientHoldNumber IS NOT NULL)
                OR (h1.code = CONCAT('HLD-', h2.clientHoldNumber) AND h2.clientHoldNumber IS NOT NULL)
                OR (CONCAT('HLD-', h1.clientHoldNumber) = h2.code AND h1.clientHoldNumber IS NOT NULL)
              )
              AND h1.id > h2.id;
          `);

          await queryInterface.sequelize.query(`
            UPDATE holds
            SET code = CONCAT('HLD-', COALESCE(clientHoldNumber, id))
            WHERE code IS NULL OR code = '';
          `);

          await queryInterface.sequelize.query(`
            DELETE h1 FROM holds h1
            INNER JOIN holds h2
            ON (h1.clientId = h2.clientId OR (h1.clientId IS NULL AND h2.clientId IS NULL))
              AND h1.code = h2.code AND h1.id > h2.id;
          `);

          try {
            await queryInterface.sequelize.query(`
              UPDATE sales_orders so
              LEFT JOIN holds h ON so.holdId = h.id
              SET so.holdId = NULL
              WHERE so.holdId IS NOT NULL AND h.id IS NULL;
            `);
          } catch {}

          try {
            await queryInterface.sequelize.query(`
              DELETE iph FROM inventory_product_holds iph
              LEFT JOIN holds h ON iph.holdId = h.id
              WHERE h.id IS NULL;
            `);
          } catch {}
        }

        // ----------------------------------------------------
        // F. CREDIT DEBIT NOTES
        // ----------------------------------------------------
        if (await tableExists('credit_debit_notes')) {
          await safeDropIndex('credit_debit_notes', 'cdn_client_code_unique');

          await queryInterface.sequelize.query(`
            DELETE c1 FROM credit_debit_notes c1
            INNER JOIN credit_debit_notes c2
            ON (c1.clientId = c2.clientId OR (c1.clientId IS NULL AND c2.clientId IS NULL))
              AND (
                (c1.code = c2.code AND c1.code IS NOT NULL AND c1.code != '')
                OR (c1.clientCreditNoteNumber = c2.clientCreditNoteNumber AND c1.clientCreditNoteNumber IS NOT NULL)
                OR (c1.creditNoteNumber = c2.creditNoteNumber AND c1.creditNoteNumber IS NOT NULL)
              )
              AND c1.id > c2.id;
          `);

          await queryInterface.sequelize.query(`
            UPDATE credit_debit_notes
            SET code = CONCAT('CN-', COALESCE(clientCreditNoteNumber, creditNoteNumber, id))
            WHERE code IS NULL OR code = '';
          `);

          await queryInterface.sequelize.query(`
            DELETE c1 FROM credit_debit_notes c1
            INNER JOIN credit_debit_notes c2
            ON (c1.clientId = c2.clientId OR (c1.clientId IS NULL AND c2.clientId IS NULL))
              AND c1.code = c2.code AND c1.id > c2.id;
          `);

          if (await tableExists('credit_debit_note_settlements')) {
            try {
              await queryInterface.sequelize.query(`
                DELETE cdns FROM credit_debit_note_settlements cdns
                LEFT JOIN credit_debit_notes cdn ON cdns.creditDebitNoteId = cdn.id
                WHERE cdn.id IS NULL;
              `);
            } catch {}
          }
        }
      } finally {
        await queryInterface.sequelize.query('SET SQL_SAFE_UPDATES = 1;');
        await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      }

      // 3. Add unique constraints [clientId, code] to all document tables
      const uniqueIndexConfigs = [
        { table: 'sales_orders', name: 'sales_orders_client_code_unique' },
        { table: 'purchase_orders', name: 'purchase_orders_client_code_unique' },
        { table: 'packaging_lists', name: 'packaging_lists_client_code_unique' },
        { table: 'loading_orders', name: 'loading_orders_client_code_unique' },
        { table: 'holds', name: 'holds_client_code_unique' },
        { table: 'credit_debit_notes', name: 'cdn_client_code_unique' },
      ];

      for (const cfg of uniqueIndexConfigs) {
        if (await tableExists(cfg.table)) {
          await safeAddUniqueIndex(cfg.table, ['clientId', 'code'], cfg.name);
        }
      }
    } catch (err) {
      console.error('=== MIGRATION FAILED ===');
      console.error('Error Name:', err.name);
      console.error('Error Message:', err.message);
      if (err.sql) console.error('Failing SQL:', err.sql);
      if (err.original) console.error('Original Error:', err.original.message || err.original);
      if (err.errors) console.error('Validation Errors:', err.errors);
      console.error('========================');
      throw err;
    }
  },

  async down(queryInterface) {
    const safeRemoveIndex = async (table, indexName) => {
      try {
        await queryInterface.removeIndex(table, indexName);
      } catch (err) {
        console.warn(`Could not remove index ${indexName} from ${table}:`, err.message);
      }
    };

    const uniqueIndexConfigs = [
      { table: 'sales_orders', name: 'sales_orders_client_code_unique' },
      { table: 'purchase_orders', name: 'purchase_orders_client_code_unique' },
      { table: 'packaging_lists', name: 'packaging_lists_client_code_unique' },
      { table: 'loading_orders', name: 'loading_orders_client_code_unique' },
      { table: 'holds', name: 'holds_client_code_unique' },
      { table: 'credit_debit_notes', name: 'cdn_client_code_unique' },
    ];

    for (const cfg of uniqueIndexConfigs) {
      await safeRemoveIndex(cfg.table, cfg.name);
    }
  },
};
