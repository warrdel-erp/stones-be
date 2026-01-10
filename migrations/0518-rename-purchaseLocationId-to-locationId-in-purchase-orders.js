"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename purchaseLocationId column to locationId
    await queryInterface.renameColumn("purchase_orders", "purchaseLocationId", "locationId");
  },

  async down(queryInterface, Sequelize) {
    // Rename locationId column back to purchaseLocationId
    await queryInterface.renameColumn("purchase_orders", "locationId", "purchaseLocationId");
  },
};
