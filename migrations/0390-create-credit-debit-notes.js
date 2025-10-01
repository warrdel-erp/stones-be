"use strict";

const CREDIT_NOTE_REFERENCE_TYPES = {
  PAYMENT: "payment",
};

const JOURNAL_ENTRY_FOR_TYPES = {
  CUSTOMER: "customer",
  VENDOR: "vendor",
};

const CREDIT_DEBIT_NOTE_TYPES = {
  CREDIT: "credit",
  DEBIT: "debit",
};

module.exports = {
  up: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.createTable("credit_debit_notes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      entryFor: {
        type: Sequelize.ENUM(...Object.values(JOURNAL_ENTRY_FOR_TYPES)),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(...Object.values(CREDIT_DEBIT_NOTE_TYPES)),
      },
      entryIdFor: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      referenceType: {
        type: Sequelize.ENUM(...Object.values(CREDIT_NOTE_REFERENCE_TYPES)),
      },
      referenceId: {
        type: Sequelize.INTEGER,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
  down: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.dropTable("credit_debit_notes");
  },
};
