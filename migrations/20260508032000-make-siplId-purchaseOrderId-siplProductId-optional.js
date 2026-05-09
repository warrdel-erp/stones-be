'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // InventoryProduct
    await queryInterface.changeColumn('inventory_products', 'siplId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Slabs
    await queryInterface.changeColumn('slabs', 'siplId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('slabs', 'purchaseOrderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('slabs', 'siplProductId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // InventoryProduct
    await queryInterface.changeColumn('inventory_products', 'siplId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Slabs
    await queryInterface.changeColumn('slabs', 'siplId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('slabs', 'purchaseOrderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('slabs', 'siplProductId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
