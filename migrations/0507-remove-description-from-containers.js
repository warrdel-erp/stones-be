"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if description column exists before removing it
    const tableDescription = await queryInterface.describeTable("containers");

    if (tableDescription.description) {
      await queryInterface.removeColumn("containers", "description");
    }
  },

  async down(queryInterface, Sequelize) {
    // Add description column back
    await queryInterface.addColumn("containers", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
