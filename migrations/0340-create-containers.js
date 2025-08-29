"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("containers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      referenceType: {
        type: Sequelize.ENUM("sipl", "purchase_order"),
        allowNull: false,
      },
      referenceId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
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
    await queryInterface.dropTable("containers");
  },
};
