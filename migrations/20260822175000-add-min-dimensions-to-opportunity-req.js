'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('opportunity_requirement_products', 'min_length', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
    await queryInterface.addColumn('opportunity_requirement_products', 'min_width', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('opportunity_requirement_products', 'min_length');
    await queryInterface.removeColumn('opportunity_requirement_products', 'min_width');
  },
};
