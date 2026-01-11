"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename location column to locationName
    await queryInterface.renameColumn("locations", "location", "locationName");

    // Add addressLine column
    await queryInterface.addColumn("locations", "addressLine", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove addressLine column
    await queryInterface.removeColumn("locations", "addressLine");

    // Rename locationName column back to location
    await queryInterface.renameColumn("locations", "locationName", "location");
  },
};
