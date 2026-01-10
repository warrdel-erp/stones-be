"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename soLocationId column to locationId
    await queryInterface.renameColumn("sales_orders", "soLocationId", "locationId");
  },

  async down(queryInterface, Sequelize) {
    // Rename locationId column back to soLocationId
    await queryInterface.renameColumn("sales_orders", "locationId", "soLocationId");
  },
};
