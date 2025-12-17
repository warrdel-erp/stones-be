"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add container column to purchase_orders table
    await queryInterface.addColumn("purchase_orders", "container", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove container column
    await queryInterface.removeColumn("purchase_orders", "container");
  },
};

