"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customers", "customerCode", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "name",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customers", "customerCode");
  },
};
