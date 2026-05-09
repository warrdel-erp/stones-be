'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inventory_products', 'receivedDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('inventory_products', 'FOBcost', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inventory_products', 'receivedDate');
    await queryInterface.removeColumn('inventory_products', 'FOBcost');
  }
};
