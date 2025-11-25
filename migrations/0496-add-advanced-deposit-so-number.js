"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("advanced_deposits", "soAdvancedDepositNumber", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("advanced_deposits", "soAdvancedDepositNumber");
  },
};
