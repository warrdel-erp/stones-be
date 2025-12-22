"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("user_permissions", "account_permissions");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("account_permissions", "user_permissions");
  },
};
