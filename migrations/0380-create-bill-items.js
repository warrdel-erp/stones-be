"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bill_items", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      service: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ledgerAccountId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ledger_accounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      billId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "bills",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("bill_items");
  },
};
