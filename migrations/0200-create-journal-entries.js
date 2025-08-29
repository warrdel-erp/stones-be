"use strict";

const JOURNAL_ENTRY_PROCESS_TYPE = {
  CREATE_SIPL: "create_sipl",
  ADD_FREIGHT_BILL: "add_freight_bill",
  RECEIVE_INVENTORY: "receive_inventory",
  SIPL_PAYMENT: "sipl_payment",
  BILL_PAYMENT: "bill_payment",
  SO_INVOICING: "so_invoicing",
  SO_INVOICE_PAYMENT: "so_invoice_payment",
  CONFIRM_RETURN: "confirm_return",
  custom: "custom",
};

const JOURNAL_ENTRY_SUB_REFERENCE_TYPES = {
  SIPL_PRODUCT: "sipl_product",
  PRODUCT: "product",
  SLAB: "slab",
  BILL_ITEM: "bill_item",
  BILL: "bill",
  LOADING_ORDER: "loading_order",
};

const JOURNAL_ENTRY_REFERENCE_TYPES = {
  SIPL: "SIPL",
  BILL: "BILL",
  LOADING_ORDER: "LOADING_ORDER",
  LOADING_ORDER_INVOICE: "LOADING_ORDER_INVOICE",
  SALES_ORDER: "SALES_ORDER",
  RETURN: "RETURN",
};

const JOURNAL_ENTRY_FOR_TYPES = {
  SIPL: "SIPL",
  LOADING_ORDER: "LOADING_ORDER",
  RETURN: "RETURN",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("journal_entries", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2), // Stores exact financial values
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("cr", "dr"), // Credit or Debit
        allowNull: false,
      },
      ledgerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ledger_accounts",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      locationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "locations",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      partyLedgerAccountId: {
        type: Sequelize.INTEGER,
        references: {
          model: "ledger_accounts",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      processType: {
        type: Sequelize.ENUM(...Object.values(JOURNAL_ENTRY_PROCESS_TYPE)),
        allowNull: true,
      },
      subReferenceId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Nullable for general transactions
      },
      subReferenceType: {
        type: Sequelize.ENUM(...Object.values(JOURNAL_ENTRY_SUB_REFERENCE_TYPES)),
        allowNull: true, // Required only if referenceId is used
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Nullable for general transactions
      },
      referenceType: {
        type: Sequelize.ENUM(...Object.values(JOURNAL_ENTRY_REFERENCE_TYPES)),
        allowNull: true, // Required only if referenceId is used
      },
      entryFor: {
        type: Sequelize.ENUM(...Object.values(JOURNAL_ENTRY_FOR_TYPES)),
        allowNull: true,
      },
      entryForId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      balance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("journal_entries");
  },
};
