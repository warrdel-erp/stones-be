"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Extend the ENUM for inventory_products.status to include BROKEN
    await queryInterface.changeColumn("inventory_products", "status", {
      type: Sequelize.ENUM("INITIATE", "IN_INVENTORY", "READJUSTED", "ALLOCATED", "SOLD", "BROKEN"),
      allowNull: true,
      defaultValue: "INITIATE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the ENUM for inventory_products.status to the previous values (without BROKEN)
    await queryInterface.changeColumn("inventory_products", "status", {
      type: Sequelize.ENUM("INITIATE", "IN_INVENTORY", "READJUSTED", "ALLOCATED", "SOLD"),
      allowNull: true,
      defaultValue: "INITIATE",
    });
  },
};


