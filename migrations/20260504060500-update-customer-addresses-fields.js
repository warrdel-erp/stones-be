"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Make address column nullable
    await queryInterface.changeColumn("customer_addresses", "address", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Remove unit column
    await queryInterface.removeColumn("customer_addresses", "unit");
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Add unit column back
    await queryInterface.addColumn("customer_addresses", "unit", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Make address column non-nullable (warning: might fail if there are nulls)
    await queryInterface.changeColumn("customer_addresses", "address", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
