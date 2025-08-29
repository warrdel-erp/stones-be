"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ledger_accounts", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM("cr", "dr"),
        allowNull: false,
      },
      openingBalance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      openingDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      subHeaderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      code: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      referenceType: {
        type: Sequelize.ENUM("CUSTOMER", "VENDOR"),
        allowNull: true,
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
    });

    // Add unique index
    await queryInterface.addIndex("ledger_accounts", ["clientId", "key"], {
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ledger_accounts");
  },
};
