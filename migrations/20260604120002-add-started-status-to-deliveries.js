"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MySQL requires re-defining the ENUM with the new value
    await queryInterface.changeColumn("deliveries", "status", {
      type: Sequelize.ENUM("pending", "approved", "rejected", "completed", "started"),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("deliveries", "status", {
      type: Sequelize.ENUM("pending", "approved", "rejected", "completed"),
      allowNull: true,
    });
  },
};
