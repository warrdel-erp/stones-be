'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('model_sequences', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      modelName: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      scopeKey: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'GLOBAL',
      },
      lastNumber: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex(
      'model_sequences',
      ['clientId', 'modelName', 'scopeKey'],
      {
        unique: true,
        name: 'model_sequences_client_model_scope_unique',
      }
    );

    // Backfill existing sequence data from tables for all clients
    const backfillQueries = [
      // SALES_ORDER
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'SALES_ORDER', 'GLOBAL', COALESCE(MAX(so.clientSoNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN sales_orders so ON so.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // PURCHASE_ORDER
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'PURCHASE_ORDER', 'GLOBAL', COALESCE(MAX(po.clientPoNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN purchase_orders po ON po.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // LOADING_ORDER
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'LOADING_ORDER', 'GLOBAL', COALESCE(MAX(lo.clientLoNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN loading_orders lo ON lo.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // SIPL
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'SIPL', 'GLOBAL', COALESCE(MAX(s.clientInvoiceNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN sipls s ON s.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // SALES_ORDER_INVOICE
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'SALES_ORDER_INVOICE', 'GLOBAL', COALESCE(MAX(soi.clientSoInvoiceNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN sales_order_invoices soi ON soi.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // PACKAGING_LIST
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'PACKAGING_LIST', 'GLOBAL', COALESCE(MAX(pl.clientPlNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN packaging_lists pl ON pl.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // HOLD
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'HOLD', 'GLOBAL', COALESCE(MAX(h.clientHoldNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN holds h ON h.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // BILL
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'BILL', 'GLOBAL', COALESCE(MAX(b.clientBillNumber), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN bills b ON b.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // PAYMENT
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'PAYMENT', 'GLOBAL', COALESCE(MAX(p.clientTransactionNo), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN payments p ON p.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // CREDIT_DEBIT_NOTE
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'CREDIT_DEBIT_NOTE', 'GLOBAL', COALESCE(MAX(CAST(cdn.creditNoteNumber AS UNSIGNED)), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN credit_debit_notes cdn ON cdn.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // CUSTOMER
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT c.id, 'CUSTOMER', 'GLOBAL', COALESCE(MAX(CAST(cust.customerCode AS UNSIGNED)), 0), NOW(), NOW()
       FROM clients c
       LEFT JOIN customers cust ON cust.clientId = c.id
       GROUP BY c.id
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // PAYMENT_CODE (per accountPrefix from payments)
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT clientId, 'PAYMENT_CODE', LEFT(transactionCode, 3), COALESCE(MAX(CAST(SUBSTRING(transactionCode, 4) AS UNSIGNED)), 0), NOW(), NOW()
       FROM payments
       WHERE clientId IS NOT NULL AND transactionCode IS NOT NULL AND LENGTH(transactionCode) > 3
       GROUP BY clientId, LEFT(transactionCode, 3)
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // SO_LOADING_ORDER (per salesOrderId)
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT lo.clientId, 'SO_LOADING_ORDER', CAST(lo.salesOrderId AS CHAR), COALESCE(MAX(lo.soLoadingOrderNumber), 0), NOW(), NOW()
       FROM loading_orders lo
       WHERE lo.clientId IS NOT NULL AND lo.salesOrderId IS NOT NULL
       GROUP BY lo.clientId, lo.salesOrderId
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // SO_INVOICE (per salesOrderId)
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT soi.clientId, 'SO_INVOICE', CAST(soi.salesOrderId AS CHAR), COALESCE(MAX(soi.soInvoiceNumber), 0), NOW(), NOW()
       FROM sales_order_invoices soi
       WHERE soi.clientId IS NOT NULL AND soi.salesOrderId IS NOT NULL
       GROUP BY soi.clientId, soi.salesOrderId
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // SO_PACKAGING_LIST (per salesOrderId)
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT pl.clientId, 'SO_PACKAGING_LIST', CAST(pl.salesOrderId AS CHAR), COALESCE(MAX(pl.soPackagingListNumber), 0), NOW(), NOW()
       FROM packaging_lists pl
       WHERE pl.clientId IS NOT NULL AND pl.salesOrderId IS NOT NULL
       GROUP BY pl.clientId, pl.salesOrderId
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // PO_SIPL (per purchaseOrderId)
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT s.clientId, 'PO_SIPL', CAST(s.purchaseOrderId AS CHAR), COALESCE(MAX(s.poSiplNumber), 0), NOW(), NOW()
       FROM sipls s
       WHERE s.clientId IS NOT NULL AND s.purchaseOrderId IS NOT NULL
       GROUP BY s.clientId, s.purchaseOrderId
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // SIPL_BILL (per referenceId where referenceType='sipl')
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT b.clientId, 'SIPL_BILL', CAST(b.referenceId AS CHAR), COALESCE(MAX(b.siplBillNumber), 0), NOW(), NOW()
       FROM bills b
       WHERE b.clientId IS NOT NULL AND b.referenceId IS NOT NULL AND b.referenceType = 'sipl'
       GROUP BY b.clientId, b.referenceId
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // RETURN (per invoiceId)
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT r.clientId, 'RETURN', CAST(r.invoiceId AS CHAR), COALESCE(MAX(r.roInvoiceNumber), 0), NOW(), NOW()
       FROM \`returns\` r
       WHERE r.clientId IS NOT NULL AND r.invoiceId IS NOT NULL
       GROUP BY r.clientId, r.invoiceId
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,

      // ADVANCED_DEPOSIT (per salesOrderId)
      `INSERT INTO model_sequences (clientId, modelName, scopeKey, lastNumber, createdAt, updatedAt)
       SELECT so.clientId, 'ADVANCED_DEPOSIT', CAST(ad.salesOrderId AS CHAR), COALESCE(MAX(ad.soAdvancedDepositNumber), 0), NOW(), NOW()
       FROM advanced_deposits ad
       JOIN sales_orders so ON ad.salesOrderId = so.id
       WHERE so.clientId IS NOT NULL AND ad.salesOrderId IS NOT NULL
       GROUP BY so.clientId, ad.salesOrderId
       ON DUPLICATE KEY UPDATE lastNumber = VALUES(lastNumber);`,
    ];

    for (const query of backfillQueries) {
      try {
        await queryInterface.sequelize.query(query);
      } catch (err) {
        console.warn('Warning during model_sequences backfill query:', err.message);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('model_sequences');
  },
};
