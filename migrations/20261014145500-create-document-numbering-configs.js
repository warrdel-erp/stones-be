'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create document_numbering_configs table
    await queryInterface.createTable('document_numbering_configs', {
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
      documentType: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      prefix: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      includeYear: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      separator: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: '-',
      },
      numberLength: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 4,
      },
      sequenceReset: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'YEARLY',
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
      'document_numbering_configs',
      ['clientId', 'documentType'],
      {
        unique: true,
        name: 'doc_numbering_client_type_unique',
      }
    );

    // 2. Add missing code and number columns to respective document tables
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

    const safeAddIndex = async (table, fields, indexOptions) => {
      try {
        await queryInterface.addIndex(table, fields, indexOptions);
      } catch (err) {
        console.warn(`Index ${indexOptions.name || fields.join('_')} on ${table} already exists or failed:`, err.message);
      }
    };

    // sales_orders
    await safeAddColumn('sales_orders', 'code', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await safeAddIndex('sales_orders', ['clientId', 'code'], {
      unique: true,
      name: 'sales_orders_client_code_unique',
    });

    // purchase_orders
    await safeAddColumn('purchase_orders', 'code', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await safeAddIndex('purchase_orders', ['clientId', 'code'], {
      unique: true,
      name: 'purchase_orders_client_code_unique',
    });

    // opportunity_quotations
    await safeAddColumn('opportunity_quotations', 'clientQuoteNumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await safeAddColumn('opportunity_quotations', 'code', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await safeAddIndex('opportunity_quotations', ['clientId', 'clientQuoteNumber'], {
      unique: true,
      name: 'opp_quotes_client_number_unique',
    });
    await safeAddIndex('opportunity_quotations', ['clientId', 'code'], {
      unique: true,
      name: 'opp_quotes_client_code_unique',
    });

    // deliveries
    await safeAddColumn('deliveries', 'clientDeliveryNumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await safeAddColumn('deliveries', 'code', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await safeAddIndex('deliveries', ['clientId', 'clientDeliveryNumber'], {
      unique: true,
      name: 'deliveries_client_number_unique',
    });
    await safeAddIndex('deliveries', ['clientId', 'code'], {
      unique: true,
      name: 'deliveries_client_code_unique',
    });

    // packaging_lists
    await safeAddIndex('packaging_lists', ['clientId', 'code'], {
      unique: true,
      name: 'packaging_lists_client_code_unique',
    });

    // loading_orders
    await safeAddIndex('loading_orders', ['clientId', 'code'], {
      unique: true,
      name: 'loading_orders_client_code_unique',
    });

    // credit_debit_notes
    await safeAddColumn('credit_debit_notes', 'clientCreditNoteNumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await safeAddColumn('credit_debit_notes', 'code', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await safeAddIndex('credit_debit_notes', ['clientId', 'clientCreditNoteNumber'], {
      unique: true,
      name: 'cdn_client_number_unique',
    });
    await safeAddIndex('credit_debit_notes', ['clientId', 'code'], {
      unique: true,
      name: 'cdn_client_code_unique',
    });

    // 3. Seed default numbering configs for all existing clients
    const defaultConfigs = [
      { documentType: 'QUOTATION', prefix: 'QT', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'SALES_ORDER', prefix: 'SO', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'PACKAGING_LIST', prefix: 'PL', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'LOADING_ORDER', prefix: 'LO', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'DELIVERY_NOTE', prefix: 'DN', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'PURCHASE_ORDER', prefix: 'PO', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'GOODS_RECEIPT', prefix: 'GR', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'INVOICE', prefix: 'INV', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'CREDIT_NOTE', prefix: 'CN', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
      { documentType: 'PAYMENT_RECEIPT', prefix: 'REC', includeYear: true, separator: '-', numberLength: 4, sequenceReset: 'YEARLY' },
    ];

    try {
      const [clients] = await queryInterface.sequelize.query('SELECT id FROM clients;');
      for (const client of clients) {
        for (const cfg of defaultConfigs) {
          await queryInterface.sequelize.query(
            `INSERT INTO document_numbering_configs 
              (clientId, documentType, prefix, includeYear, \`separator\`, numberLength, sequenceReset, createdAt, updatedAt)
             VALUES 
              (:clientId, :documentType, :prefix, :includeYear, :separator, :numberLength, :sequenceReset, NOW(), NOW())
             ON DUPLICATE KEY UPDATE prefix = prefix;`,
            {
              replacements: {
                clientId: client.id,
                documentType: cfg.documentType,
                prefix: cfg.prefix,
                includeYear: cfg.includeYear ? 1 : 0,
                separator: cfg.separator,
                numberLength: cfg.numberLength,
                sequenceReset: cfg.sequenceReset,
              },
            }
          );
        }
      }
    } catch (err) {
      console.warn('Seeding default document numbering configs warning:', err.message);
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('document_numbering_configs');
  },
};
