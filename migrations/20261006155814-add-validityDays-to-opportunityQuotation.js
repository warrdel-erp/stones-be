'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('opportunity_quotations', 'validityDays', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('opportunity_quotations', 'validityDays');
  }
};
