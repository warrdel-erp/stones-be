'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add to deliveries
    await queryInterface.addColumn('deliveries', 'fromLat', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('deliveries', 'fromLng', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('deliveries', 'fromAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Remove from delivery_addresses
    await queryInterface.removeColumn('delivery_addresses', 'fromLat');
    await queryInterface.removeColumn('delivery_addresses', 'fromLng');
    await queryInterface.removeColumn('delivery_addresses', 'fromAddress');
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse
    await queryInterface.addColumn('delivery_addresses', 'fromLat', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_addresses', 'fromLng', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('delivery_addresses', 'fromAddress', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.removeColumn('deliveries', 'fromLat');
    await queryInterface.removeColumn('deliveries', 'fromLng');
    await queryInterface.removeColumn('deliveries', 'fromAddress');
  }
};
