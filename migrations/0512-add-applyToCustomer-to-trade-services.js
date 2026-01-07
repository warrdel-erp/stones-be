"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("trade_services", "applyToCustomer", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("trade_services", "applyToCustomer");
  },
};
