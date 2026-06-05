"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add status column to trucks
    await queryInterface.addColumn("trucks", "status", {
      type: Sequelize.ENUM("available", "on_delivery", "maintenance"),
      allowNull: false,
      defaultValue: "available",
    });

    // Add driverUserId FK column to trucks
    await queryInterface.addColumn("trucks", "driverUserId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("trucks", "driverUserId");
    await queryInterface.removeColumn("trucks", "status");
  },
};
