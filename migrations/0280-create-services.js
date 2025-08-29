"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("services", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      uom: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      basePrice: {
        type: Sequelize.FLOAT,
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      serviceCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "service_categories",
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
    await queryInterface.dropTable("services");
  },
};
