"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("holds");

    // Remove expiryDays column if created previously
    if (tableInfo.expiryDays) {
      await queryInterface.removeColumn("holds", "expiryDays");
    }

    // Add expiresAt column if not existing
    if (!tableInfo.expiresAt) {
      await queryInterface.addColumn("holds", "expiresAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Backfill existing holds: set expiresAt = createdAt + 7 days
    await queryInterface.sequelize.query(
      `UPDATE holds 
       SET expiresAt = DATE_ADD(createdAt, INTERVAL 7 DAY) 
       WHERE expiresAt IS NULL;`
    );
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("holds");

    if (tableInfo.expiresAt) {
      await queryInterface.removeColumn("holds", "expiresAt");
    }
  },
};
