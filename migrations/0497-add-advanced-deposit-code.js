"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("advanced_deposits", "code", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("advanced_deposits", "code");
  },
};
