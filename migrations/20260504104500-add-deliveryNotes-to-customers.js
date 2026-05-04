"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customers", "deliveryNotes", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "internalNotes",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customers", "deliveryNotes");
  },
};
