'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Change `packagingListId` to allowNull: true in `loading_orders`
    await queryInterface.changeColumn('loading_orders', 'packagingListId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 2. Change `packagingListId` to allowNull: true in `sales_order_invoices`
    await queryInterface.changeColumn('sales_order_invoices', 'packagingListId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 3. Add `loadingOrderId` to `sales_order_invoices`
    await queryInterface.addColumn('sales_order_invoices', 'loadingOrderId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'loading_orders',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sales_order_invoices', 'loadingOrderId');

    await queryInterface.changeColumn('sales_order_invoices', 'packagingListId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.changeColumn('loading_orders', 'packagingListId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
