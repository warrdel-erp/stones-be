'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the vendorId FK column and add vendorName string column
    await queryInterface.removeColumn('inventory_product_metadata', 'vendorId');
    await queryInterface.addColumn('inventory_product_metadata', 'vendorName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inventory_product_metadata', 'vendorName');
    await queryInterface.addColumn('inventory_product_metadata', 'vendorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
};
