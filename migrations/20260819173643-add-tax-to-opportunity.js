'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('opportunities', 'taxRate', {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('opportunities', 'taxRate');
  }
};
