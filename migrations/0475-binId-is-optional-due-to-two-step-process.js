"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("inventory_products", "binId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.changeColumn("inventory_products", "binId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
