"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename origin to originId
    await queryInterface.renameColumn("products", "origin", "originId");
  },

  async down(queryInterface, Sequelize) {
    // Rename back to origin
    await queryInterface.renameColumn("products", "originId", "origin");
  },
};

