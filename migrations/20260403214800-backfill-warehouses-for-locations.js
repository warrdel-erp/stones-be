"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert a warehouse for every location that does not already have one
    const sql = `
      INSERT INTO warehouses (locationId, clientId, createdAt, updatedAt)
      SELECT l.id, l.clientId, NOW(), NOW()
      FROM locations l
      LEFT JOIN warehouses w ON l.id = w.locationId
      WHERE w.id IS NULL;
    `;
    await queryInterface.sequelize.query(sql, { raw: true });
  },

  down: async (queryInterface, Sequelize) => {
    // This is a bit tricky to reverse without knowing which ones were created by this migration.
    // However, since every location SHOULD have a warehouse, we might not want to just delete all warehouses.
    // A safe way might be to delete warehouses that were created automatically and have no associated data (bins, etc.), 
    // but a simpler undo is often not possible for data backfills.
    // Given the requirement that all locations should have a warehouse, undoing this would mean going back to an "invalid" state.
    
    // For safety, we can leave the down migration empty or perform a very specific cleanup if needed.
    // But usually for these kinds of data migrations, we keep it empty or minimal.
    // Let's do nothing to avoid deleting user-created warehouses.
  },
};
