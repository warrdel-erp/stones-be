"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MySQL requires re-defining the ENUM with the new value
    await queryInterface.changeColumn("trucks", "status", {
      type: Sequelize.ENUM("available", "in_approved_delivery", "on_delivery", "maintenance"),
      allowNull: false,
      defaultValue: "available",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("trucks", "status", {
      type: Sequelize.ENUM("available", "on_delivery", "maintenance"),
      allowNull: false,
      defaultValue: "available",
    });
  },
};
