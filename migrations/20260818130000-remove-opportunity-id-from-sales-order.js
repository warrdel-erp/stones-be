'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('sales_orders');
    if (table.opportunityId) {
      await queryInterface.removeColumn('sales_orders', 'opportunityId');
    }
  },

  async down (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('sales_orders');
    if (!table.opportunityId) {
      await queryInterface.addColumn('sales_orders', 'opportunityId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'opportunities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  }
};
