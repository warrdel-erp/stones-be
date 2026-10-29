'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('customers', 'taxExempt');
    } catch (e) {
      console.warn("Could not remove column taxExempt from customers:", e.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('customers', 'taxExempt', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    } catch (e) {
      console.warn("Could not add column taxExempt to customers:", e.message);
    }
  }
};
