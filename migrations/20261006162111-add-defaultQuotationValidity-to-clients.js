'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Clients', 'defaultQuotationValidity', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30, // By default 30 days based on the mock
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Clients', 'defaultQuotationValidity');
  }
};
