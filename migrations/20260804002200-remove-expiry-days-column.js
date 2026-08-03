"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("holds");
    if (tableInfo.expiryDays) {
      await queryInterface.removeColumn("holds", "expiryDays");
    }
  },

  down: async (queryInterface, Sequelize) => {},
};
