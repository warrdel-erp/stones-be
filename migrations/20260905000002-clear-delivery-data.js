'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Disable foreign key checks to allow clearing tables cleanly
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    try {
      // Clear all delivery items
      await queryInterface.bulkDelete('delivery_items', null, { truncate: true, cascade: true });
      
      // Clear all delivery addresses
      await queryInterface.bulkDelete('delivery_addresses', null, { truncate: true, cascade: true });

      // Clear all deliveries
      await queryInterface.bulkDelete('deliveries', null, { truncate: true, cascade: true });

      // Reset truck statuses if any are stuck in delivery statuses
      await queryInterface.sequelize.query(
        `UPDATE trucks SET status = 'available' WHERE status IN ('in_approved_delivery', 'on_delivery');`
      );

    } finally {
      // Re-enable foreign key checks
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // This is a data clearing migration, so it cannot be cleanly reversed.
    console.log("This migration cleared all delivery data and cannot be undone.");
  }
};
