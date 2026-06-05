"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "role", {
      type: Sequelize.ENUM("admin", "driver"),
      allowNull: false,
      defaultValue: "admin",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "role");
    // Also drop the ENUM type (MySQL does this automatically when the column is removed)
  },
};
